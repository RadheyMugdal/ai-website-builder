import { db } from "@/db";
import { message, project } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { getUsageStatusByUserId } from "@/lib/usage";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const messageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ message: z.string(), projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const usage = await getUsageStatusByUserId(ctx.auth.user.id, ctx.subscriptionStatus as any)
      if (usage?.remainingPoints === 0) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Not enough credits",
        });
      }
      const [existingProject] = await db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.projectId),
            eq(project.userId, ctx.auth.user.id)
          )
        );

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      const [createdMessage] = await db
        .insert(message)
        .values({
          content: input.message,
          projectId: input.projectId,
          role: "user",
        })
        .returning();
      if (!createdMessage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create message",
        });
      }
      const messages = await db
        .select()
        .from(message)
        .where(eq(message.projectId, input.projectId));
      await inngest.send({
        name: "code/generate",
        data: {
          prompt: input.message,
          projectId: input.projectId,
          sandboxId: existingProject.sandboxId,
          plan: ctx.subscriptionStatus
        },
      });
      return createdMessage;
    }),
});
