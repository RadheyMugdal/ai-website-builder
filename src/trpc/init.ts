import { auth } from "@/lib/auth";
import { getUsageStatus } from "@/lib/usage";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
// import superjson from "superjson";
import { cache } from "react";
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return {};
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }


  return next({
    ctx: {
      ...ctx,
      auth: session,
    },
  });
});


export const premiumProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const usage = await getUsageStatus(ctx.auth.user.id);
  if (usage?.credits === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough credits" });
  }
  return next();
})