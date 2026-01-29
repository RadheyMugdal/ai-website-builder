import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";



export type ProjectData =
  inferRouterOutputs<AppRouter>["project"]["getById"]["project"];

