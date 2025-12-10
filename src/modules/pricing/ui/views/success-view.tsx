"use client"

import { useEffect } from "react";
import confetti from "canvas-confetti"
import Loader from "@/components/global/loader"
import Logo from "@/components/global/logo"
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Check } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation";

export default function SuccessView() {
    const trpc = useTRPC()
    const { data, isLoading } = useSuspenseQuery(trpc.pricing.getCurrentSubscription.queryOptions())
    if (!data) {
        redirect("/pricing")
    }

    useEffect(() => {
        if (isLoading) return
        const hasSeenConfetti = localStorage.getItem("hasSeenConfetti")
        if (!hasSeenConfetti) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            })
            localStorage.setItem("hasSeenConfetti", "true")

            // Optionally clear the flag after 10 seconds
            setTimeout(() => {
                localStorage.removeItem("hasSeenConfetti")
            }, 10000)
        }
    }, [isLoading])

    if (isLoading) return <Loader />
    if (!data) return <div className="text-center mt-12">Could not load subscription details.</div>

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <div className="max-w-lg w-full">
                <div className="mb-6 w-fit mx-auto">
                    <Logo />
                </div>
                <h1 className="text-3xl font-bold my-4">
                    🎉 Thank you for subscribing to the {data.subscription[0].status} Plan!
                </h1>

                <p className="text-lg  opacity-75 mb-6">
                    Your payment was successful. You now have full access to all premium features of the {data.subscription[0].status} plan.
                </p>

                {data?.polarSubscriptionProduct && data?.polarSubscriptionProduct.benefits.length > 0 && (
                    <div className="mb-6 w-full p-4 border rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                            🚀 Enjoy these benefits:
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                            {data?.polarSubscriptionProduct.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center text-sm gap-2">
                                    <Check className="size-4 text-green-500" />
                                    {benefit.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="space-y-4">
                    <Link href="/">
                        <Button className="w-full">Start Building</Button>
                    </Link>

                    <p className="text-sm text-gray-500">
                        A confirmation email has been sent. Need help?{" "}
                        <a href="mailto:support@yourapp.com" className="underline">
                            Contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
