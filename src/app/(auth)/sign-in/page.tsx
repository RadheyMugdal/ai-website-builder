"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { redirect, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
   email: z.string().email({ message: "Invalid email address" }),
   password: z
      .string()
      .min(5, { message: "Password must be at least 5 characters long" }),
});

const SignInPage = () => {
   const [loading, setLoading] = useState(false);
   const [socialLoading, setSocialLoading] = useState(false);
   const searchParams = useSearchParams();
   const lastMethod = authClient.getLastUsedLoginMethod();
   const handleSocialLogin = async (provider: "google" | "github") => {
      setSocialLoading(true);
      await authClient.signIn.social({
         provider,
         callbackURL: `${searchParams.get("redirect") || "/"}?input=${encodeURIComponent(searchParams.get("input") || "")}`,
      });
      setSocialLoading(false);
   };
   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         email: "",
         password: "",
      },
   });

   async function onSubmit(values: z.infer<typeof formSchema>) {
      setLoading(true);
      await authClient.signIn.email(
         {
            email: values.email,
            password: values.password,
         },
         {
            onSuccess: () => {
               if (searchParams.get("redirect")) {
                  redirect(
                     `${searchParams.get("redirect")!}?input=` +
                        encodeURIComponent(searchParams.get("input") || ""),
                  );
               } else {
                  redirect(
                     `/?input=` +
                        encodeURIComponent(searchParams.get("input") || ""),
                  );
               }
            },
            onError(context) {
               toast.error(context.error.message || "Failed to login");
            },
         },
      );
      setLoading(false);
   }

   return (
      <main className=" w-screen h-screen  grid md:grid-cols-2 p-2 max-w-7xl mx-auto">
         <div className="flex flex-col order-2  md:order-1 gap-6 p-4  sm:p-12 lg:px-28 md:justify-center ">
            <div className=" space-y-2">
               <h2 className=" text-2xl md:text-3xl font-semibold">
                  Welcome back!
               </h2>
               <p className="text-sm  opacity-80">
                  Sign in to keep building smarter, faster, and beautifully with
                  Wavely.
               </p>
            </div>

            <div className="  flex flex-wrap  gap-4">
               <Button
                  variant={"outline"}
                  className="flex-1 relative"
                  disabled={loading || socialLoading}
                  onClick={() => handleSocialLogin("google")}
               >
                  {lastMethod === "google" && (
                     <Badge
                        variant={"secondary"}
                        className="text-[10px] !py-[2px]  absolute -top-3 -right-2"
                     >
                        Last used
                     </Badge>
                  )}
                  <FcGoogle />
                  Sign in with Google
               </Button>
               <Button
                  variant={"outline"}
                  className="flex-1 relative"
                  disabled={loading || socialLoading}
                  onClick={() => handleSocialLogin("github")}
               >
                  {lastMethod === "github" && (
                     <Badge
                        variant={"secondary"}
                        className="text-[10px] !py-[2px]  absolute -top-3 -right-2"
                     >
                        Last used
                     </Badge>
                  )}
                  <FaGithub />
                  Sign in with Github
               </Button>
            </div>
            <div className="flex max-w-full items-center justify-center  gap-2">
               <hr className=" w-full" />
               <p className="text-xs opacity-80 ">Or</p>
               <hr className="w-full" />
            </div>
            <Form {...form}>
               <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 "
               >
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
                              <PasswordInput
                                 placeholder="Enter your password"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <Button
                     type="submit"
                     disabled={loading || socialLoading}
                     className=" w-full mt-6"
                  >
                     {loading ? (
                        <>
                           <Loader2 className="animate-spin" />
                           Signing in...
                        </>
                     ) : (
                        "Sign In"
                     )}
                  </Button>
               </form>
            </Form>
            <div>
               <p className=" text-sm opacity-80 text-center">
                  Don't have an account?{" "}
                  <Link href={"/sign-up"} className=" underline">
                     Sign Up
                  </Link>
               </p>
            </div>
         </div>
         <div className="bg-primary order-1 md:order-2  h-[15vh] md:h-full  text-primary-foreground rounded-2xl md:flex flex-col justify-between  text-center   relative overflow-hidden">
            {/* Logo */}
            <Link href={"/"}>
               <Image
                  src={"/wavely-logo-auth-page.png"}
                  alt="Wavely logo"
                  width={120}
                  height={120}
                  className="m-4"
               />
            </Link>

            <div className="  m-8  hidden  relative z-10 gap-2 md:flex flex-col items-start">
               <h1 className=" text-xl md:text-4xl lg:text-5xl  font-semibold">
                  Build smarter
               </h1>
               <p className="  text-start">
                  Faster, smarter, and beautifully designed tools to supercharge
                  your workflow.
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

export default SignInPage;
