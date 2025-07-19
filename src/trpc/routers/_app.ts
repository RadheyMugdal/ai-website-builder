import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { projectRouter } from "@/modules/project/server/procedure";
export const appRouter = createTRPCRouter({
  project: projectRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
