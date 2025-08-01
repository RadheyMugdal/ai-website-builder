import { auth } from "@/lib/auth";
import { polarClient } from "@/lib/polar";
import { getUsageStatusByUserId, getUsageTracker, plan } from "@/lib/usage";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { headers } from "next/headers";

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
        const subscription = await polarClient.subscriptions.list({
            externalCustomerId: ctx.auth.user.id,
        });

        const activeSubscription = subscription.result.items.find(
            (s) => s.status === "active"
        );

        return activeSubscription?.product ?? null;
    }),
    getCredits: protectedProcedure.query(async ({ ctx }) => {
        const usage = await getUsageStatusByUserId(ctx.auth.user.id, ctx.subscriptionStatus as any)
        return usage
    })
})