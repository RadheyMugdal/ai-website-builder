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
  Crown,
  Loader2,
  MonitorSmartphone,
  Moon,
  Square,
  Sun,
  Waves,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { MessageCard, AssistantMessageCard } from "../components/MessageCard";
import { Messages, ProjectData } from "../../schema";
import LoadingState from "../components/LoadingState";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatMsAsFutureDate } from "@/lib/utils";
import { useTheme } from "next-themes";

const ChatView = ({
  projectData,
  messageData,
}: {
  projectData: ProjectData;
  messageData: Messages;
}) => {
  const trpc = useTRPC();
  const { setTheme } = useTheme()
  const router = useRouter();
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Messages>(messageData);
  const createMessage = useMutation(trpc.message.create.mutationOptions({
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const { data: usageData } = useSuspenseQuery(
    trpc.pricing.getCredits.queryOptions(undefined, { refetchInterval: 2000 })

  )
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const newUserMessage = await createMessage.mutateAsync({
        message: input,
        projectId: projectData.id,
      });
      setMessages([...messages, newUserMessage]);
    } catch (error) {
      if (createMessage.isError) {
        toast.error(createMessage.error.message);
        setIsLoading(false);
        return;
      }
    }
    setInput("");
    setIsLoading(false);
  };
  const { data: subscriptionData } = useSuspenseQuery(
    trpc.pricing.getCurrentSubscription.queryOptions()
  )
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
      <header className="bg-background py-3 px-4 flex justify-between items-center border-b shrink-0">
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
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun />Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon />
                    Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <MonitorSmartphone />System</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
        {
          !subscriptionData && (
            <Button size={"sm"} onClick={() => router.push("/pricing")}>
              <Crown />
              Upgrade
            </Button>
          )
        }
      </header>
      {/* Chat area */}
      <div className="flex flex-col flex-1 overflow-hidden px-4 py-2 relative">
        <div className="absolute  flex justify-between items-center top-0 left-0 right-0   border-b bg-background py-2 px-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs font-semibold">{usageData?.remainingPoints} Credits remaining</p>
            <span className="text-xs opacity-75">Resets at {formatMsAsFutureDate(usageData?.msBeforeNext!)}</span>
          </div>
        </div>
        {/* Scrollable messages */}
        <div className="flex-1 mt-8 overflow-y-auto flex flex-col gap-4 pr-2">
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
        <div className="pt-4 shrink-0 ">

          <PromptInput
            value={input}
            onValueChange={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            className="relative"
          >

            <PromptInputTextarea placeholder="Ask me anything..." />
            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction
                tooltip={isLoading ? "Stop generation" : "Send message"}
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
        </div>
      </div>
    </div>
  );
};

export default ChatView;
