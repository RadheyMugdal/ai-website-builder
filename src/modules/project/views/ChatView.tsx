"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Square,
  Waves,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { MessageCard, AssistantMessageCard } from "../components/MessageCard";
import { Messages, ProjectData } from "../schema";
import LoadingState from "../components/LoadingState";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ChatView = ({
  projectData,
  messageData,
}: {
  projectData: ProjectData;
  messageData: Messages;
}) => {
  const trpc = useTRPC();
  const router = useRouter();
  const [messages, setMessages] = useState<Messages>(messageData);
  const createMessage = useMutation(trpc.message.create.mutationOptions());
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const handleSubmit = async () => {
    setIsLoading(true);
    const newUserMessage = await createMessage.mutateAsync({
      message: input,
      projectId: projectData.id,
    });
    if (createMessage.isError) {
      toast.error(createMessage.error.message);
      setIsLoading(false);
      return;
    }
    setMessages([...messages, newUserMessage]);
    setInput("");
    setIsLoading(false);
  };
  useEffect(() => {
    setMessages(messageData);
  }, [messageData]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full">
      {" "}
      {/* ensures full height */}
      {/* Header */}
      <header className="bg-background py-3 px-4 border-b shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1" asChild>
            <Button variant="outline" size="sm">
              <Waves className="size-5 text-primary" />
              <h2 className="text-sm">Next.js Project</h2>
              <ChevronDown size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="  w-44">
            <DropdownMenuItem
              onClick={() => {
                router.push("/");
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Go to Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Change Theme</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Light</DropdownMenuItem>
                  <DropdownMenuItem>Dark</DropdownMenuItem>
                  <DropdownMenuItem>System</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      {/* Chat area */}
      <div className="flex flex-col flex-1 overflow-hidden px-4 py-2">
        {/* Scrollable messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2">
          {messages.map((message, index) => {
            if (message.role === "assistant") {
              return <AssistantMessageCard key={index} message={message} />;
            } else {
              return <MessageCard key={index} message={message} />;
            }
          })}
          {messages[messages.length - 1].role === "user" &&
            projectData.status === "generating" && <LoadingState />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="pt-4 shrink-0">
          <PromptInput
            value={input}
            onValueChange={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
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
                    <ArrowUp className="size-5" />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
