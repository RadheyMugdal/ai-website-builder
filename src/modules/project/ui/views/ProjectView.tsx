"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import axios from "axios";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import ChatView from "./ChatView";
import EditorView from "./EditorView";
import { SandboxClient } from "@codesandbox/sdk";
import { useEffect, useRef, useState } from "react";
import { connectToSandbox } from '@codesandbox/sdk/browser';
import Loading from "@/app/loading";

interface props {
  projectId: string;
}

const ProjectView = ({ projectId }: props) => {
  const [client, setClient] = useState<SandboxClient>()
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.project.getById.queryOptions(
      { id: projectId },
    )
  );

  const clientRef = useRef<SandboxClient | null>(null);

  useEffect(() => {
    if (!data.project) return;

    let active = true;

    const initializeSandbox = async () => {
      const getSession = async () => {
        const res = await axios.get(`/api/sandbox/${data.project.sandboxId}`);
        return res.data.session;
      };

      const newClient = await connectToSandbox({
        session: await getSession(),
        getSession,
      });

      if (!active) {
        newClient.disconnect();
        return;
      }

      clientRef.current = newClient;
      setClient(newClient);
    };

    initializeSandbox();

    return () => {
      active = false;
      clientRef.current?.disconnect();
    };
  }, [data.project]);

  if (!client) {
    return <Loading />

  }

  return (
    <main className="w-screen h-screen">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={40} minSize={30} className="h-full">
          <ChatView
            projectData={data.project}
            sandboxId={data.project.sandboxId as string}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>
          <EditorView projectData={data.project} client={client as SandboxClient} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
};

export default ProjectView;
