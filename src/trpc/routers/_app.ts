import { messageRouter } from "@/modules/chat/server/server";
import { createTRPCRouter } from "../init";
import { projectRouter } from "@/modules/project/server/server";
export const appRouter = createTRPCRouter({
  project: projectRouter,
  message: messageRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
