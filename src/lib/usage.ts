import { db } from "@/db";
import { user, subscription } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Plan = "Free" | "Pro" | "Enterprise";

export const CREDITS_PER_PLAN: Record<Plan, number> = {
    "Free": 5,
    "Pro": 100,
    "Enterprise": 200
};

const RESET_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function getUsageStatus(userId: string) {
    const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);

    if (userData.length === 0) throw new Error("User not found");
    const userRecord = userData[0];

    // Fetch subscription separately
    const userSubscription = await db.select().from(subscription).where(eq(subscription.userId, userId)).limit(1);

    const currentPlan: Plan = (userSubscription[0]?.status as Plan) || "Free";
    const now = new Date();
    const lastReset = new Date(userRecord.lastResetDate);

    // Check if we need to reset credits (Lazy Reset)
    if (now.getTime() - lastReset.getTime() > RESET_INTERVAL_MS) {
        const newCredits = CREDITS_PER_PLAN[currentPlan];

        await db.update(user)
            .set({
                credits: newCredits,
                lastResetDate: now
            })
            .where(eq(user.id, userId));

        return { credits: newCredits, plan: currentPlan };
    }

    return { credits: userRecord.credits, plan: currentPlan };
}

export async function consumeCredits(userId: string) {
    const status = await getUsageStatus(userId);

    if (status.credits <= 0) {
        return { success: false, message: "Insufficient credits" };
    }

    await db.update(user)
        .set({ credits: status.credits - 1 })
        .where(eq(user.id, userId));

    return { success: true, remaining: status.credits - 1 };
}