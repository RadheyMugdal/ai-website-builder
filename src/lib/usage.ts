
import { rateLimiterFlexibleSchema } from "@/db/schema";
import { RateLimiterDrizzle } from 'rate-limiter-flexible'
import { drizzle } from "drizzle-orm/neon-serverless";

export const db = drizzle(process.env.DATABASE_URL!);
export type plan = "Free" | "Pro" | "Enterprise"

const CREDITS: { plan: plan, credits: number }[] = [
    { plan: "Free", credits: 5 },
    { plan: "Pro", credits: 100 },
    { plan: "Enterprise", credits: 200 }
]

const FREE_ASSETS = 5;
export const DURATION = 30 * 24 * 60 * 60;
const GENERATION_COST = 1;

export async function getUsageTracker(plan: plan) {
    const usageTracker = new RateLimiterDrizzle({
        storeClient: db,
        schema: rateLimiterFlexibleSchema,
        duration: DURATION,
        points: CREDITS.find(c => c.plan === plan)?.credits,

    })


    return usageTracker
}

// export async function consumeCredits() {
//     const data = await auth.api.getSession({ headers: await headers() })
//     if (!data?.user.id) {
//         throw new Error("User not authenticated");
//     }
//     const usageTracker = await getUsageTracker()
//     const result = await usageTracker.consume(data.user.id, GENERATION_COST)
//     return result
// }

// export async function getUsageStatus() {
//     const data = await auth.api.getSession({ headers: await headers() })
//     if (!data?.user.id) {
//         throw new Error("User not authenticated");
//     }
//     const usageTracker = await getUsageTracker()
//     const result = await usageTracker.get(data.user.id)
//     return result
// }

export async function getUsageStatusByUserId(userId: string, plan: "Free" | "Pro" | "Enterprise") {
    const usageTracker = await getUsageTracker(plan)
    const result = await usageTracker.get(userId)
    return result
}

export async function consumeUserIdCredit(userId: string, plan: "Free" | "Pro" | "Enterprise") {
    const usageTracker = await getUsageTracker(plan)
    const result = await usageTracker.consume(userId, GENERATION_COST)
    return result
}