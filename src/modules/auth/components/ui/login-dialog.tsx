"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import React from "react";
import { useLoginDialogStore } from "../../store/login-dialog-store";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { LuWaves } from "react-icons/lu";
import { authClient } from "@/lib/auth-client";

const LoginDialog = () => {
  const { isOpen, close, setOpen } = useLoginDialogStore();
  const handleSocialLogin = async (provider: "google" | "github") => {
    await authClient.signIn.social({
      provider,
      callbackURL: "/",
    });
  };
  return (
    <Dialog open={isOpen} defaultOpen onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <span>
            <LuWaves className=" size-10 text-primary" />
          </span>
          <DialogTitle className=" text-3xl">
            Join and start building
          </DialogTitle>
          <DialogDescription>
            Log in to start building your dream application
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
