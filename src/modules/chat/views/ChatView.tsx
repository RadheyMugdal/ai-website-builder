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

import { ArrowUp, Square } from "lucide-react";
import React, { useState } from "react";

const ChatView = () => {
  const { data } = authClient.useSession();
  const [input, setInput] = useState("");
  const { setOpen } = useLoginDialogStore();
  const [isLoading, setIsLoading] = useState(false);

  const trpc = useTRPC();
  const createProject = useMutation(trpc.project.create.mutationOptions());
  const handleSubmit = async () => {
    if (!data?.user) {
      setOpen(true);
      return;
    }
    setIsLoading(true);
    // await createProject.mutate({ prompt: input });
    setIsLoading(false);
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
              onClick={handleSubmit}
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
