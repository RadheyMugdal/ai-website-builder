import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { CheckCircle2, Flame } from 'lucide-react'
import React from 'react'

interface PricingCardProps {
    id: string
    name: string
    highlighted: boolean
    description: string
    benefits: any[]
    price: any
    recurringInterval: string
    isCurrentSubscription: boolean
}

const PricingCard = ({ id, name, highlighted, description, benefits, price, recurringInterval, isCurrentSubscription }: PricingCardProps) => {
    return (
        <div className={
            cn(
                'rounded-lg h-full relative border p-4 gap-4 flex flex-col',
                {
                    " border-primary  overflow-hidden": highlighted
                }
            )
        }>
            {
                highlighted && (
                    <div className=' flex absolute items-center gap-1 text-primary-foreground text-sm  top-0 right-0 bg-primary p-2'>
                        <Flame className='size-4' />Popular
                    </div>
                )
            }

            <div className='flex flex-col '>
                <h2 className='text-lg font-semibold'>{name}</h2>
                <p className=' opacity-75'>{description}</p>
            </div>
            <div>
                <span className='flex gap-1  items-baseline'>
                    <span className=' font-bold text-5xl'>
                        {price}
                    </span>
                    <span className='text-sm '>{recurringInterval}</span>
                </span>
            </div>

            <Button variant={highlighted ? "default" : "outline"}
                onClick={async () => {
                    if (isCurrentSubscription) {
                        await authClient.customer.portal()
                        return
                    }
                    authClient.checkout({
                        products: [id],
                    })
                }}
            >
                {
                    isCurrentSubscription ? "Manage Subscription" : "Select plan"
                }
            </Button>
            <Separator />
            <div className='flex flex-col gap-3'>
                {
                    benefits.map((benefit) => (
                        <div className='flex gap-1 items-center' key={benefit.id}>
                            <CheckCircle2 className=' size-4' />
                            <p key={benefit.id} className='text-sm opacity-75'>{benefit.description}</p>
                        </div>
                    ))
                }
            </div>


        </div>
    )
}

export default PricingCard
