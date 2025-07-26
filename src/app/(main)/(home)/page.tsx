import Loader from "@/components/global/loader";
import { auth } from "@/lib/auth";
import ChatView from "@/modules/chat/views/ChatView";
import HomePageView from "@/modules/chat/views/HomePageView";
import ProjectsView from "@/modules/chat/views/ProjectsView";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const page = async () => {
  const queryClient = getQueryClient();
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    void queryClient.prefetchQuery(trpc.project.getUserProjects.queryOptions());
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<Loader />}>
          <HomePageView isLoggedIn={!!session} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default page;
