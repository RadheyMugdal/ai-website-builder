"use client";
import { useTRPC } from '@/trpc/client';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import PricingCard from '../components/pricing-card';
import { authClient } from '@/lib/auth-client';

const PricingView = () => {
    const trpc = useTRPC()
    const { data } = authClient.useSession()
    const { data: products } = useSuspenseQuery(
        trpc.pricing.getProducts.queryOptions()
    )
    const { data: currentSubscription } = useQuery(
        trpc.pricing.getCurrentSubscription.queryOptions(undefined, {
            enabled: !!data?.session
        })
    )
    return (
        <main className='w-full flex  py-8  md:py-4 flex-col gap-8  '>

            <div className='flex flex-col gap-2 items-center justify-center'>
                <h1 className=' text-3xl md:text-5xl font-bold'>Pricing</h1>
                <p className=' text-sm md:text-base text-center text-balance  opacity-75'>Upgrade your plan and increase your monthly credits.</p>
            </div>
            <div className=' grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))]  mx-auto  max-w-6xl  items-center   gap-6 py-8  px-4 md:px-12 w-full '>
                <PricingCard
                    id="free"
                    name="Free"
                    highlighted={false}
                    description="For individuals who want to try out the platform"
                    isLoggedIn={!!data?.session}
                    benefits={[
                        {
                            id: "1",
                            description: "5 credits monthly",
                        },
                        {
                            id: "2",
                            description: "Public projects",
                        },
                        {
                            id: "3",
                            description: "Export project",
                        },
                    ]}
                    price="$0"
                    recurringInterval=""
                    isCurrentSubscription={!currentSubscription && !!data?.session}
                />
                {
                    products.map((product) => {
                        const price = product.prices[0]
                        const isFree = price.amountType !== "fixed"
                        const isHighlighted = product.metadata.variant === "highlighted"
                        const priceAmount = isFree ? "Free" : `$${price.priceAmount / 100}`
                        const recurringInterval = isFree ? "" : `/${price.recurringInterval}`
                        const isCurrentSubscription = currentSubscription?.id === product.id
                        return (
                            <PricingCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                highlighted={isHighlighted}
                                description={product.description!}
                                benefits={product.benefits}
                                price={priceAmount}
                                recurringInterval={recurringInterval}
                                isCurrentSubscription={isCurrentSubscription}
                                isLoggedIn={!!data?.session}
                            />
                        )
                    })
                }

            </div>

        </main >
    )
}

export default PricingView
