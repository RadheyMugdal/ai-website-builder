import ErrorState from "@/components/global/error-state";
import Loader from "@/components/global/loader";
import { auth } from "@/lib/auth";
import { DEFAULT_PAGE_SIZE } from "@/modules/chat/constants";
import HomePageView from "@/modules/chat/ui/views/HomePageView";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const page = async () => {
  const queryClient = getQueryClient();
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    void queryClient.prefetchInfiniteQuery(
      trpc.project.getUserProjects.infiniteQueryOptions(
        {
          cursor: undefined,
          limit: DEFAULT_PAGE_SIZE,
        },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
      )
    );
  }


  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<ErrorState title="Something went wrong" description="Please try again later" />}>
        <Suspense fallback={<Loader />}>
          <HomePageView isLoggedIn={!!session} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default page;
