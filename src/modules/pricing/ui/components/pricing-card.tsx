import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

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
            router.push("/sign-in");
            return;
        }

        if (name !== "Free" && isCurrentSubscription) {
            await authClient.customer.portal();
            return;
        }

        await authClient.checkout({ products: [id] });
    };

    return (
        <div
            className={cn(
                "relative h-full flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
                !highlighted && " hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
                highlighted && " from-primary/10 to-background border-primary/50 shadow-xl shadow-primary/10"
            )}
        >
            {highlighted && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-bl-lg flex items-center gap-1.5">
                    <Sparkles className="size-3" />
                    Most Popular
                </div>
            )}

            <div className="p-6 flex flex-col h-full">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight mb-2">{name}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>

                <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold tracking-tighter">{price}</span>
                        {price !== "Free" && (
                            <span className="text-muted-foreground text-sm">/{recurringInterval}</span>
                        )}
                    </div>
                </div>

                <Button
                    disabled={isLoggedIn && name === "Free"}
                    variant={highlighted ? "default" : "outline"}
                    size="lg"
                    className={cn(
                        "w-full mb-8 font-medium transition-all duration-300",
                        !highlighted && "hover:bg-primary hover:text-primary-foreground"
                    )}
                    onClick={handleClick}
                >
                    {isCurrentSubscription
                        ? name === "Free"
                            ? "Current plan"
                            : "Manage subscription"
                        : name === "Free"
                            ? "Start for free"
                            : `Get started`}
                </Button>

                <div className="flex-1">
                    <h4 className="text-sm font-semibold mb-4 text-foreground/80">What's included</h4>
                    <div className="space-y-3">
                        {benefits.map((benefit) => (
                            <div className="flex gap-3 items-start group" key={benefit.id}>
                                <div className={cn(
                                    "rounded-full p-0.5 mt-0.5 transition-colors",
                                    highlighted ? "bg-primary/20" : "bg-primary/10 group-hover:bg-primary/20"
                                )}>
                                    <Check className={cn(
                                        "size-3.5",
                                        highlighted ? "text-primary" : "text-primary"
                                    )} />
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingCard;
