import Loader from '@/components/global/loader'
import { auth } from '@/lib/auth'
import PricingView from '@/modules/pricing/ui/views/pricing-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const PricingPage = async () => {
    const data = await auth.api.getSession({
        headers: await headers()
    })
    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(
        trpc.pricing.getProducts.queryOptions()
    )
    if (data?.session) {
        void queryClient.prefetchQuery(
            trpc.pricing.getCurrentSubscription.queryOptions()
        )
    }
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<Loader />}>
                <ErrorBoundary fallback={<div>Error</div>}>
                    <PricingView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}

export default PricingPage
