"use client";
import Logo from "@/components/global/logo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import ChatView from "./ChatView";
import EditorView from "./EditorView";
interface props {
  projectId: string;
}
const ProjectView = ({ projectId }: props) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.project.getById.queryOptions(
      { id: projectId },
      {
        refetchInterval: 2000,
      }
    )
  );
  return (
    <main className=" w-screen h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40} minSize={30} className=" h-full">
          <ChatView messageData={data.messages} projectData={data.project} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>
          <EditorView projectData={data.project} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
};

export default ProjectView;
