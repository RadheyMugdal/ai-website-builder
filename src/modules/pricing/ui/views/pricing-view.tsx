"use client";
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query';
import PricingCard from '../components/pricing-card'

const PricingView = () => {
    const trpc = useTRPC()
    const { data: products } = useSuspenseQuery(
        trpc.pricing.getProducts.queryOptions()
    )
    const { data: currentSubscription } = useSuspenseQuery(
        trpc.pricing.getCurrentSubscription.queryOptions()
    )
    return (
        <main className='w-full flex   flex-col py-16 gap-8  '>

            <div className='flex flex-col gap-3 items-center justify-center'>
                <h1 className='text-5xl font-bold'>Plans and Pricing</h1>
                <p className=' opacity-75'>Upgrade your plan and increase your monthly credits.</p>
            </div>
            <div className=' grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))]  mx-auto  max-w-6xl  items-center   gap-6 py-8 px-12 w-full '>
                <PricingCard
                    id="free"
                    name="Free"
                    highlighted={false}
                    description="For individuals who want to try out the platform"
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
                    price="Free"
                    recurringInterval=""
                    isCurrentSubscription={false}
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
                            />
                        )
                    })
                }

            </div>

        </main >
    )
}

export default PricingView
