"use client";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { authClient } from "@/lib/auth-client";
import { useLoginDialogStore } from "@/modules/auth/store/login-dialog-store";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { ArrowUp, Square } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const ChatView = () => {
  const { data } = authClient.useSession();
  const [input, setInput] = useState("");
  const { setOpen } = useLoginDialogStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();
  const createProject = useMutation(trpc.project.create.mutationOptions());
  const handleSubmit = async () => {
    if (!data?.user) {
      setOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const created = await createProject.mutateAsync({ prompt: input });
      toast.success("Project created successfully");
      router.push(`/project/${created.id}`);
    } catch (err: any) {
      toast.error(err?.message ??   "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (value: string) => {
    setInput(value);
  };
  return (
    <div className=" w-full max-w-3xl">
      <PromptInput
        value={input}
        onValueChange={handleValueChange}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        className=" w-full"
      >
        <PromptInputTextarea placeholder="Ask me anything..." />
        <PromptInputActions className="justify-end pt-2">
          <PromptInputAction
            tooltip={isLoading ? "Stop generation" : "Send message"}
          >
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              {isLoading ? (
                <Square className="size-5 fill-current" />
              ) : (
                <ArrowUp className="size-5  " />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
};

export default ChatView;
