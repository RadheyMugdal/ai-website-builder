import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { CheckCircle2, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface PricingCardProps {
    id: string;
    name: string;
    highlighted: boolean;
    description: string;
    benefits: { id: string; description: string }[];
    price: string;
    recurringInterval: string;
    isCurrentSubscription: boolean;
    isLoggedIn: boolean;
}

const PricingCard = ({
    id,
    name,
    highlighted,
    description,
    benefits,
    price,
    recurringInterval,
    isCurrentSubscription,
    isLoggedIn,
}: PricingCardProps) => {
    const router = useRouter();

    const handleClick = async () => {
        if (!isLoggedIn) {
            router.push('/sign-in');
            return;
        }

        if (name !== 'Free' && isCurrentSubscription) {
            await authClient.customer.portal();
            return;
        }

        await authClient.checkout({ products: [id] });
    };

    return (
        <div
            className={cn(
                'rounded-lg h-full relative border p-4 gap-4 flex flex-col',
                {
                    'border-primary overflow-hidden': highlighted,
                }
            )}
        >
            {highlighted && (
                <div className="flex absolute items-center gap-1 text-primary-foreground text-sm top-0 right-0 bg-primary p-2">
                    <Flame className="size-4" />
                    Popular
                </div>
            )}

            <div className="flex flex-col">
                <h2 className="text-lg font-semibold">{name}</h2>
                <p className="opacity-75">{description}</p>
            </div>

            <div>
                <span className="flex gap-1 items-baseline">
                    <span className="font-bold text-5xl">{price}</span>
                    <span className="text-sm">{recurringInterval}</span>
                </span>
            </div>

            <Button
                disabled={isLoggedIn && name === 'Free'}
                variant={highlighted ? 'default' : 'outline'}
                onClick={handleClick}
            >
                {
                    isCurrentSubscription ?
                        (name === "Free" ? "Current plan" : "Mange subscription") :
                        (name === "Free" ? "Let's get started" : "Select plan")
                }
            </Button>

            <Separator />

            <div className="flex flex-col gap-3">
                {benefits.map((benefit) => (
                    <div className="flex gap-1 items-center" key={benefit.id}>
                        <CheckCircle2 className="size-4" />
                        <p className="text-sm opacity-75">{benefit.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingCard;
