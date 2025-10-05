import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { CheckCircle2, Flame } from "lucide-react";
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
                "rounded-lg h-full relative bg-card border p-4 gap-6 flex flex-col",
                {
                    " overflow-hidden": highlighted,
                }
            )}
        >
            {highlighted && (
                <div className="flex absolute items-center gap-1 text-primary-foreground text-sm top-0 right-0 bg-primary p-2">
                    <Flame className="size-4" />
                    Popular
                </div>
            )}

            <div className="flex flex-col gap-1">
                <h2 className=" text-xl md:text-2xl font-semibold">{name}</h2>
                <p className="opacity-75 text-sm">{description}</p>
            </div>
            <div className=" flex flex-col gap-6">
                <div className=" my-2">
                    <span className="flex flex-col justify-center gap-2 items-center">
                        <span className="font-bold text-5xl md:text-6xl">{price}</span>
                        <span className="text-sm">{recurringInterval}</span>
                    </span>
                </div>

                <Button
                    disabled={isLoggedIn && name === "Free"}
                    variant={highlighted ? "default" : "secondary"}
                    onClick={handleClick}
                >
                    {isCurrentSubscription
                        ? name === "Free"
                            ? "Current plan"
                            : "Mange subscription"
                        : name === "Free"
                            ? "Start for Free"
                            : `Upgrade to ${name}`}
                </Button>
            </div>
            <Separator />
            <div className="space-y-3">
                <h4>Features</h4>
                <div className="flex flex-col gap-3">
                    {benefits.map((benefit) => (
                        <div className="flex gap-2 items-center" key={benefit.id}>
                            <CheckCircle2 className="size-4 text-green-500 opacity-70 " />
                            <p className=" text-sm opacity-70">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingCard;
