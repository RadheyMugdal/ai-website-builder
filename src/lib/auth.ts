import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schema";
import { db } from "@/db/index";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { polarClient } from "./polar";
import { DURATION, getUsageTracker, plan } from "./usage";
import { eq } from "drizzle-orm";
import { subscription } from "../db/schema";


export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),


  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          const [createdSubscription] = await db.insert(subscription).values({
            userId: user.id,
            status: "Free"
          }).returning()
        }
      }
    }
  },

  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          successUrl: "/payment-complete",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          async onSubscriptionCreated(payload) {
            const subscriptionPlan = payload.data.product.name
            const subscriptionId = payload.data.id
            const userId = payload.data.customer.externalId
            await db.update(subscription).set({
              id: subscriptionId,
              status: subscriptionPlan as any
            }).where(
              eq(subscription.userId, userId!)
            )
            return
          },
          async onSubscriptionUpdated(payload) {
            const subscriptionPlan = payload.data.product.name
            const subscriptionId = payload.data.id
            const userId = payload.data.customer.externalId
            await db.update(subscription).set({
              status: subscriptionPlan as any
            }).where(
              eq(subscription.userId, userId!)
            )
            const usageTracker = await getUsageTracker(subscriptionPlan as plan)
            await usageTracker.set(payload.data.customer.externalId!, 0, DURATION)
            return
          },
          async onSubscriptionCanceled(payload) {
            const subscriptionPlan = payload.data.product.name
            const subscriptionId = payload.data.id
            const userId = payload.data.customer.externalId
            await db.update(subscription).set({
              status: subscriptionPlan as any
            }).where(
              eq(subscription.userId, userId!)
            )
            return
          },

        })
      ]
    })
  ]
});
