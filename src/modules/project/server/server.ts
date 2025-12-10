import { db } from "@/db";
import { message, project } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { polarClient } from "@/lib/polar";
import { templateFiles } from "@/lib/template";
import { getUsageStatus } from "@/lib/usage";
import { DEFAULT_PAGE_SIZE } from "@/modules/chat/constants";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { Daytona, Sandbox } from "@daytonaio/sdk";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, like, lt, or, sql } from "drizzle-orm";
import z from "zod";

export const projectRouter = createTRPCRouter({
  getUserProjects: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createdAt: z.string(),
            id: z.string(),
          })
          .optional(),
        limit: z.number().default(DEFAULT_PAGE_SIZE),
      })
    )
    .query(async ({ ctx, input }) => {
      let whereClause: any = eq(project.userId, ctx.auth.user.id);
      if (input.cursor) {
        whereClause = and(
          eq(project.userId, ctx.auth.user.id),
          or(
            lt(project.createdAt, new Date(input.cursor.createdAt)),
            and(
              eq(project.createdAt, new Date(input.cursor.createdAt)),
              lt(project.id, input.cursor.id)
            )
          )
        );
      }
      const projects = await db
        .select()
        .from(project)
        .where(whereClause)
        .limit(input.limit + 1)
        .orderBy(desc(project.createdAt), desc(project.id));
      let nextCursor;
      if (projects.length > input.limit) {
        const lastProject = projects.pop();
        nextCursor = {
          id: lastProject!.id,
          createdAt: lastProject!.createdAt.toISOString(),
        };
      }

      return {
        projects,
        nextCursor: nextCursor ?? null,
      };
    }),
  create: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const usage = await getUsageStatus(
        ctx.auth.user.id
      );
      if (usage?.credits === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough credits",
        });
      }
      const [createdProject] = await db
        .insert(project)!
        .values({
          files: templateFiles,
          userId: ctx.auth.user.id,
        })
        .returning({
          id: project.id,
        });

      if (!createdProject) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }

      const createdMessage = await db.insert(message).values({
        projectId: createdProject.id,
        content: input.prompt,
        role: "user",
      });
      await inngest.send({
        name: "code/generate",
        data: {
          prompt: input.prompt,
          projectId: createdProject.id,
        },
      });
      return {
        id: createdProject.id,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const [existingProject] = await db
        .select()
        .from(project)
        .where(eq(project.id, id));
      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      const daytona = new Daytona({
        apiKey: process.env.DAYTONA_API_KEY,
        apiUrl: process.env.DAYTONA_API_URL,
        target: "us",
      });

      if (existingProject.sandboxId) {
        const sandbox = await daytona.get(existingProject.sandboxId);
        const previewlink = await sandbox.getPreviewLink(3000);
        await db
          .update(project)
          .set({ previewUrl: previewlink.url })
          .where(eq(project.id, id));

        if (sandbox.state === "archived") {
          await daytona.start(sandbox);
        } else if (sandbox.state === "started") {
          sandbox.process.executeCommand("true");
        }
      }

      const messages = await db
        .select()
        .from(message)
        .where(eq(message.projectId, id));

      return {
        project: existingProject,
        messages: messages ?? [],
      };
    }),
  deleteById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const projectToDelete = await db
        .select()
        .from(project)
        .where(eq(project.id, input.id));

      if (!projectToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      await db.delete(project).where(eq(project.id, input.id));

      return { success: true };
    }),
});
