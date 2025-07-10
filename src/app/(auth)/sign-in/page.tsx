"use client";
import { Button } from "@/components/ui/button";
import { LuWaves } from "react-icons/lu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";

const SignInPage = () => {
  const handleSocialLogin = async (provider: "google" | "github") => {
    await authClient.signIn.social({
      provider,
      callbackURL: "/",
    });
  };
  return (
    <main className=" w-screen h-screen flex flex-col items-center justify-center ">
      <Card className=" min-w-lg  ">
        <CardHeader className=" flex  justify-center flex-col items-center">
          <span className="">
            <LuWaves className=" size-10 text-primary" />
          </span>
          <CardTitle className=" text-2xl">Sign In to your account</CardTitle>
          <CardDescription>
            {" "}
            Log in to start building your dream application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              variant={"outline"}
              onClick={() => handleSocialLogin("google")}
            >
              <FcGoogle />
              Sign in with Google
            </Button>
            <Button
              variant={"outline"}
              onClick={() => handleSocialLogin("github")}
            >
              <FaGithub />
              Sign in with GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default SignInPage;
