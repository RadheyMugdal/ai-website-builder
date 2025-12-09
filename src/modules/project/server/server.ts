import { db } from "@/db";
import { message, project } from "@/db/schema";

import { polarClient } from "@/lib/polar";

import { getUsageStatus } from "@/lib/usage";
import { DEFAULT_PAGE_SIZE } from "@/modules/chat/constants";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, like, lt, or, sql } from "drizzle-orm";
import { CodeSandbox } from '@codesandbox/sdk'

import z from "zod";

const csb_api_key = process.env.CODESANDBOX_KEY as string

const sdk = new CodeSandbox(csb_api_key)


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
  create: premiumProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ ctx, input }) => {

      try {

        const sandbox = await sdk.sandboxes.create({
          id: "pt_7x1pQKjPA8H6ZHZGd5htWY",
          hibernationTimeoutSeconds: 300,
        })

        const [createdProject] = await db
          .insert(project)!
          .values({
            files: {},
            userId: ctx.auth.user.id,
            sandboxId: sandbox.id,
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
        }).returning({
          id: message.id,
        })

        return {
          id: createdProject.id,
        };
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        })
      }
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
        .where(eq(project.id, input.id))
      if (!projectToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      await sdk.sandboxes.shutdown(projectToDelete[0].sandboxId as string)
      await sdk.sandboxes.delete(projectToDelete[0].sandboxId as string)
      await db.delete(project).where(eq(project.id, input.id));

      return { success: true };
    }),
});
