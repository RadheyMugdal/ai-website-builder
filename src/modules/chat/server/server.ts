import { db } from "@/db";
import { message, project } from "@/db/schema";
import { getUsageStatus } from "@/lib/usage";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const messageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ message: z.string(), projectId: z.string(), role: z.enum(["user", "assistant"]) }))
    .mutation(async ({ ctx, input }) => {
      const usage = await getUsageStatus(ctx.auth.user.id)
      if (usage?.credits <= 0) {
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
          role: input.role,
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

      return createdMessage;
    }),


});
