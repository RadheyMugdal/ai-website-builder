import ErrorState from "@/components/global/error-state";
import Loader from "@/components/global/loader";
import { auth } from "@/lib/auth";
import SuccessView from "@/modules/pricing/ui/views/success-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";


const SuccessPage = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect("/sign-in");
    }
    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(trpc.pricing.getCurrentSubscription.queryOptions())

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ErrorBoundary fallback={<ErrorState title="Could not able to load subscription details" description="Please try again later" />}>
                <Suspense fallback={<Loader />}>
                    <SuccessView />
                </Suspense>
            </ErrorBoundary>
        </HydrationBoundary>
    )
}

export default SuccessPage
