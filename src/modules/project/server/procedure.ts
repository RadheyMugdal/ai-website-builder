import { db } from "@/db";
import { message, project } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { templateFiles } from "@/lib/template";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ ctx, input }) => {
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
});
