"use client";;
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "motion/react";

import { ArrowUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";

const ChatView = () => {
  const searchParams = useSearchParams()
  const { data } = authClient.useSession();
  const [input, setInput] = useState(searchParams.get("input") || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();
  const createProject = useMutation(trpc.project.create.mutationOptions());
  const handleSubmit = async () => {
    if (!data?.user) {
      redirect("/sign-in?redirect=/&input=" + encodeURIComponent(input));
      return;
    }

    setIsLoading(true);

    try {
      const created = await createProject.mutateAsync({ prompt: input });
      toast.success("Project created successfully");
      router.push(`/project/${created.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (value: string) => {
    setInput(value);
  };
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      <PromptInput
        value={input}
        onValueChange={handleValueChange}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        className="w-full"
      >
        <PromptInputTextarea placeholder="Create Todo app for me" />
        <PromptInputActions className="justify-end pt-2">
          <PromptInputAction
            tooltip={isLoading ? "Generating project..." : "Send message"}
          >
            <Button
              onClick={handleSubmit}
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin " />
              ) : (
                <ArrowUp className="size-5  " />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </motion.div>
  );
};

export default ChatView;
