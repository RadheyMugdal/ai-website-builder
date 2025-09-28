"use client";;
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {

    zodResolver

} from "@hookform/resolvers/zod";
import z from "zod";
import Link from "next/link";
import { LuWaves } from "react-icons/lu";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(5, { message: "Password must be at least 5 characters long" }),
    confirmPassword: z.string()
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    })
const SignUpPage = () => {
    const [loading, setLoading] = useState(false)
    const [socialLoading, setSocialLoading] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const name = values.email.split("@")[0]
        await authClient.signUp.email({
            email: values.email,
            password: values.password,
            name
        },
            {
                onSuccess(context) {
                    redirect('/')
                },
                onError(context) {
                    toast.error(context.error.message || "Failed to create account. Please try again.")
                },
            })
        setLoading(false)
    }
    const handleSocialLogin = async (provider: "google" | "github") => {
        setSocialLoading(true)
        await authClient.signIn.social({
            provider,
            callbackURL: "/",
        });
        setSocialLoading(false)
    };
    return (
        <main className=" w-screen h-screen  grid md:grid-cols-2 p-2">
            <div className="flex flex-col order-2  md:order-1 gap-6 p-4  sm:p-12 lg:p-28 md:justify-center ">
                <div className=" space-y-2">
                    <h2 className=" text-2xl md:text-3xl font-semibold">Create Your Account</h2>
                    <p className="text-sm  opacity-80">Sign up to keep building smarter, faster, and beautifully with Wavely.</p>
                </div>

                <div className="  flex flex-wrap  gap-4">
                    <Button variant={"outline"} className=" flex-1" disabled={loading || socialLoading} onClick={() => handleSocialLogin("google")}>
                        <FcGoogle />
                        Sign up with Google
                    </Button>
                    <Button variant={"outline"} className=" flex-1" disabled={loading || socialLoading} onClick={() => handleSocialLogin("github")}>
                        <FaGithub />
                        Sign up with Github
                    </Button>
                </div>
                <div className="flex max-w-full items-center justify-center  gap-2">
                    <hr className=" w-full" />
                    <p className="text-xs opacity-80 ">Or</p>
                    <hr className="w-full" />

                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="jhon@doe.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="Enter your password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="Confirm your password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading || socialLoading} className=" w-full mt-6">
                            {
                                loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Signing up...
                                    </>
                                ) : "Sign Up"
                            }
                        </Button>
                    </form>
                </Form>
                <div>
                    <p className=" text-sm opacity-80 text-center">Already have an account? {" "}

                        <Link href={"/sign-in"} className=" underline">
                            Sign In
                        </Link>
                    </p>
                </div>

            </div>
            <div className="bg-primary order-1 md:order-2  h-[15vh] md:h-full  text-primary-foreground rounded-2xl md:flex flex-col justify-between  text-center   relative overflow-hidden">
                {/* Logo */}
                <div className="flex gap-2 items-center  m-4">
                    <LuWaves className=" size-6 md:size-8 " />
                    <h2 className=" font-bold text-xl md:text-2xl">Wavely</h2>
                </div>

                <div className="  m-8  hidden  relative z-10 gap-2 md:flex flex-col items-start">
                    <h1 className=" text-xl md:text-4xl lg:text-5xl  font-semibold">Build smarter</h1>
                    <p className="  text-start">
                        Faster, smarter, and beautifully designed tools to supercharge your workflow.
                    </p>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 592 370"
                    className="w-full h-auto absolute inset-x-0 bottom-0 z-0  max-h-[40%]"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M 0 370 L 0 114.828 C 0 114.828 48 16.672 110 20.5 C 172 24.328 190.5 130.138 248 130.138 C 305.5 130.138 331.5 17.948 386 20.5 C 440.5 23.052 457.5 135.103 516 130 C 574.5 124.897 592 0 592 0 L 592 370 Z"
                        fill="rgba(255, 176, 171, 0.5)"
                    />
                </svg>

            </div>
        </main>
    );
};

export default SignUpPage;
