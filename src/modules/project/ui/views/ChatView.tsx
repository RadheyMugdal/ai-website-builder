"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import {
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  Crown,
  MessageSquareCode,
  MonitorSmartphone,
  Moon,
  Square,
  Sun,
  Waves
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCard, AssistantMessageCard } from "../components/MessageCard";
import { ProjectData } from "../../schema";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";


interface ChatViewProps {
  projectData: ProjectData;
  sandboxId: string;
}

export default function ChatView({
  projectData,
  sandboxId
}: ChatViewProps) {
  const trpc = useTRPC();
  const { setTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");



  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/projects/generate",
        prepareSendMessagesRequest({ messages }) {
          return {
            body: {
              data: {
                sandboxId: projectData.sandboxId,
                projectId: projectData.id,
                userId: projectData.userId
              },
              messages,
            },
          };
        },
      }),
    [projectData.sandboxId, projectData.id]
  );

  const { messages, sendMessage, stop, status, error } = useChat({
    id: projectData.id,
    messages: (projectData.messages ?? []) as UIMessage[],
    transport,
    onError(err) {
      toast.error(err.message || "Failed to generate response");
    }
  });

  // Auto-send once when chat loads with an unanswered user message (e.g. new project with prompt)
  const hasTriggeredInitialSend = useRef(false);
  const prevProjectId = useRef(projectData.id);
  if (prevProjectId.current !== projectData.id) {
    prevProjectId.current = projectData.id;
    hasTriggeredInitialSend.current = false;
  }
  useEffect(() => {
    if (hasTriggeredInitialSend.current || !sandboxId) return;
    const initial = (projectData.messages ?? []) as UIMessage[];
    if (initial.length === 0) return;
    const last = initial[initial.length - 1];
    if (last.role !== "user") return;
    const text = last.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("")
      .trim();
    if (!text) return;
    hasTriggeredInitialSend.current = true;
    sendMessage({ text, messageId: last.id });
  }, [projectData.id, projectData.messages, sandboxId, sendMessage]);

  const isLoading = status === "submitted" || status === "streaming";



  // Scroll to bottom on new messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const handleSend = async (messageContent: string) => {
    const messageToSend = messageContent.trim();
    if (!messageToSend || isLoading) {
      return;
    }
    if (!sandboxId) {
      toast.error("Sandbox not connected");
      return;
    }

    try {
      setInput("");
      await sendMessage({ text: messageToSend });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send message";
      toast.error(message);
    }
  };

  const handleInputSubmit = useCallback(() => {
    if (input.trim()) {
      handleSend(input);
    }
  }, [handleSend, input]);

  const { data: subscriptionData } = useSuspenseQuery(
    trpc.pricing.getCurrentSubscription.queryOptions()
  );

  const { data: credits } = useSuspenseQuery(
    trpc.pricing.getCredits.queryOptions()
  );

  const stopStreaming = () => {
    void stop();
  };

  // Generate stable keys for messages
  const getMessageKey = (message: UIMessage, index: number) => {
    return message.id ?? `msg-${index}-${message.role}`;
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <header className="bg-background py-3 px-4 flex justify-between items-center border-b shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1" asChild>
            <Button variant="outline" size="sm">
              <Waves className="size-5 text-primary" />
              <h2 className="text-sm truncate">{projectData.name}</h2>
              <ChevronDown size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44">
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
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="text-white" />Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon />Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <MonitorSmartphone />System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
        {!subscriptionData && (
          <Button size={"sm"} onClick={() => router.push("/pricing")}>
            <Crown />
            Upgrade
          </Button>
        )}
      </header>

      {/* Chat area */}
      <div className="flex flex-col flex-1 overflow-hidden px-4 py-2 relative">
        {/* Credits display */}
        <div className="absolute flex justify-between items-center top-0 left-0 right-0 border-b bg-background py-2 px-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs font-semibold">{credits.credits} Credits remaining</p>
          </div>
        </div>

        {/* Scrollable messages */}
        <div className="flex-1 mt-8 overflow-y-auto flex flex-col gap-4 pr-2">
          {messages.length > 0 && (
            <>
              {messages.map((message: UIMessage, index: number) => {
                if (message.role === "assistant") {
                  return <AssistantMessageCard key={getMessageKey(message, index)} message={message} />;
                } else {
                  return <MessageCard key={getMessageKey(message, index)} message={message} />;
                }
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="pt-4 shrink-0">
          <PromptInput
            value={input}
            onValueChange={setInput}
            isLoading={isLoading}
            onSubmit={handleInputSubmit}
            className="relative"
          >
            <PromptInputTextarea
              placeholder="Ask me anything..."
            />
            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction
                tooltip={isLoading ? "Stop generation" : "Send message"}
              >
                <Button
                  onClick={isLoading ? stopStreaming : handleInputSubmit}
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={!input.trim() && !isLoading}
                >
                  {isLoading ? (
                    <Square className="size-4" />
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
}
