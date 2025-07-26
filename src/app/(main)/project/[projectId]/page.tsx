import Loader from "@/components/global/loader";
import { auth } from "@/lib/auth";
import ProjectView from "@/modules/project/views/ProjectView";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  params: Promise<{ projectId: string }>;
};

const page = async ({ params }: Props) => {
  const { projectId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.project.getById.queryOptions({ id: projectId })
  );

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense fallback={<Loader />}>
            <ProjectView projectId={projectId} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </>
  );
};

export default page;
