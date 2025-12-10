"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, DropdownMenuPortal,
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
  ChevronLeft, Crown, MonitorSmartphone,
  Moon,
  Square,
  Sun,
  Waves
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCard, AssistantMessageCard } from "../components/MessageCard";
import { Messages, ProjectData } from "../../schema";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useChat, fetchServerSentEvents, UIMessage } from "@tanstack/ai-react";
import { getTools } from "@/tools/client";
import { clientTools } from "@tanstack/ai-client"
import { SandboxClient } from "@codesandbox/sdk";
import { authClient } from "@/lib/auth-client";
const ChatView = ({
  projectData,
  messageData,
  sandboxId,
  client

}: {
  projectData: ProjectData;
  messageData: Messages;
  sandboxId: string
  client: SandboxClient

}) => {
  const trpc = useTRPC();
  const { setTheme } = useTheme()
  const router = useRouter();
  const queryClient = useQueryClient()
  const createMessage = useMutation(trpc.message.create.mutationOptions({
  }));
  const { data: session } = authClient.useSession();
  const [input, setInput] = useState("");
  const consumeCredit = useMutation(trpc.pricing.consumeCredit.mutationOptions({
    onSuccess(data, variables, onMutateResult, context) {
      queryClient.invalidateQueries(
        {
          queryKey: [trpc.pricing.getCredits.queryKey],
        }
      )
    },
  }))
  const generateInitialMessages: () => UIMessage<any>[] = () => {
    if (messageData.length === 1) {
      return []
    }
    return messageData.map((message) => {
      return {
        id: message.id,
        role: message.role,
        parts: [
          {
            type: "text",
            content: message.content
          }
        ],
        createdAt: new Date(message.createdAt),

      };
    });
  }
  const tools = useMemo(() => {
    return getTools(client)
  }, [client])
  const cltTools = clientTools(...tools)
  const { isLoading, error, messages, sendMessage, stop } = useChat({
    connection: fetchServerSentEvents('/api/projects/generate'),
    // tools: cltTools,
    body: {
      sandboxId: projectData.sandboxId
    },
    initialMessages: generateInitialMessages(),
    onFinish(message) {
      if (message.role === "assistant") {
        message.parts.forEach((part) => {
          if (part.type === "text") {
            consumeCredit.mutate()
            createMessage.mutateAsync({
              message: part.content,
              projectId: projectData.id,
              role: "assistant"
            })
          }
        })
      }
    },
  })
  // Streaming generation

  useEffect(() => {
    if (messageData.length === 1 && messages.length === 0) {
      if (messageData[0].role === "user") {
        const content = messageData[0].content
        if (!content.trim() || isLoading || !sandboxId) {
          return
        }
        sendMessage(content)
      }
    }
  }, [messageData, messages])

  const handleSend = async (message: string) => {
    const messageToSend = message.trim()
    if (!messageToSend.trim() || isLoading) {
      return;
    }
    if (!sandboxId) {
      return
    }
    await createMessage.mutateAsync({
      message: messageToSend,
      projectId: projectData.id,
      role: "user"
    })

    if (createMessage.isError) {
      toast.error(createMessage.error.message)
    }

    sendMessage(message)
  };

  const handleInputSubmit = useCallback(
    () => {
      handleSend(input);
      setInput("");
    },
    [handleSend]
  );

  const { data: subscriptionData } = useSuspenseQuery(
    trpc.pricing.getCurrentSubscription.queryOptions()
  )
  const { data: credits } = useSuspenseQuery(
    trpc.pricing.getCredits.queryOptions()
  )

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
  const stopStreaming = () => {
    stop()
  }

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
              <h2 className="text-sm truncate">{projectData.name}</h2>
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
                    <Sun className=" text-white" />Light</DropdownMenuItem>
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
            <p className="text-xs font-semibold">{credits.credits} Credits remaining</p>
            {/* <span className="text-xs opacity-75">Resets at {formatMsAsFutureDate(usageData.!)}</span> */}
          </div>
        </div>
        {/* Scrollable messages */}
        <div className="flex-1 mt-8 overflow-y-auto flex flex-col gap-4 pr-2">
          {
            messages.length > 0 && (
              <>
                {
                  messages.map((message) => {
                    if (message.role === "assistant") {
                      return <AssistantMessageCard key={message.id} message={message} />;
                    } else {
                      return <MessageCard key={message.id} message={message} />;
                    }
                  })
                }

              </>
            )
          }
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="pt-4 shrink-0 ">

          <PromptInput
            value={input}
            onValueChange={setInput}
            isLoading={isLoading}
            onSubmit={handleInputSubmit}
            className="relative"
          >

            <PromptInputTextarea placeholder="Ask me anything..." />
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
};

export default ChatView;
