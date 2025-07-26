import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type Messages =
  inferRouterOutputs<AppRouter>["project"]["getById"]["messages"];

export type ProjectData =
  inferRouterOutputs<AppRouter>["project"]["getById"]["project"];

export type Message = Messages[number];
