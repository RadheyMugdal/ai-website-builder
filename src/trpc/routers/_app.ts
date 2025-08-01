import { messageRouter } from "@/modules/chat/server/server";
import { createTRPCRouter } from "../init";
import { projectRouter } from "@/modules/project/server/server";
import { pricingRouter } from "@/modules/pricing/server/server";
export const appRouter = createTRPCRouter({
  project: projectRouter,
  message: messageRouter,
  pricing: pricingRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
