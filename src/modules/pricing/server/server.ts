import { db } from "@/db";
import { subscription } from "@/db/schema";
import { polarClient } from "@/lib/polar";
import { consumeCredits, getUsageStatus } from "@/lib/usage";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq } from "drizzle-orm";

export const pricingRouter = createTRPCRouter({
    getProducts: baseProcedure.query(async ({ }) => {
        const products = await polarClient.products.list({
            isArchived: false,
            isRecurring: true,
            sorting: ["price_amount"]
        })
        return products.result.items;
    }),
    getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
        const subData = await db.select().from(subscription).where(eq(subscription.userId, ctx.auth.user.id)).limit(1)

        return {
            subscription: subData,
        }
    }),
    getCredits: protectedProcedure.query(async ({ ctx }) => {
        const usage = await getUsageStatus(ctx.auth.user.id)
        return usage
    }),
    consumeCredit: protectedProcedure.mutation(async ({ ctx }) => {
        await consumeCredits(ctx.auth.user.id)
        return true
    })
})