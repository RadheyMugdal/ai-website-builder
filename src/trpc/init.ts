import { db } from "@/db";
import { subscription } from "@/db/schema";
import { auth } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
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
  let subscriptionStatus: "Free" | "Pro" | "Enterprise" = "Free";
  try {
    const [userSubscription] = await db
      .select({
        status: subscription.status,
      })
      .from(subscription)
      .where(eq(subscription.userId, session.user.id));

    subscriptionStatus = (userSubscription?.status ?? "Free") as
      | "Free"
      | "Pro"
      | "Enterprise";
  } catch (error) {
    // If subscription query fails, default to "Free"
    console.error("Failed to fetch user subscription:", error);
    subscriptionStatus = "Free";
  }

  return next({
    ctx: {
      ...ctx,
      auth: session,
      subscriptionStatus,
    },
  });
});
