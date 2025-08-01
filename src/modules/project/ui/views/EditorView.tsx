import React, { useEffect, useRef } from "react";
import { ProjectData } from "../../schema";
import ComponentFileViewer from "@/components/global/file-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Crown, Download, Eye, MonitorSmartphone, RotateCw, SquareArrowOutUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { previewDevices } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import UserButton from "@/components/global/user-button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { exportCode } from "@/lib/export-code";

const EditorView = ({ projectData }: { projectData: ProjectData }) => {
  const [url, setUrl] = React.useState("");
  const trpc = useTRPC()
  const router = useRouter()
  const [previewDevice, setPreviewDevice] = React.useState(previewDevices[0]);
  const iframe = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!projectData.previewUrl) return;
    setUrl(new URL(projectData.previewUrl!).pathname);
  }, [projectData]);
  const openPreview = () => {
    window.open(projectData.previewUrl!, "_blank");
  };
  const handleReload = () => {
    if (iframe.current) {
      iframe.current.src = iframe.current.src;
    }
  };

  const togglePreviewDevice = () => {
    setPreviewDevice(
      previewDevices[
      (previewDevices.indexOf(previewDevice) + 1) % previewDevices.length
      ]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const iframeUrl = new URL(projectData.previewUrl!);
    iframeUrl.pathname = url;
    if (iframe.current) {
      iframe.current.src = iframeUrl.toString();
    }
  };


  return (
    <Tabs className=" w-full h-full gap-0" defaultValue="code">
      <div className=" h-12 px-4 border-b flex items-center  justify-between  w-full">
        <TabsList>
          <TabsTrigger value="code">
            <Code />
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye />
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button variant={"outline"} onClick={async () => {
            exportCode(projectData.files as any)
          }}>
            <Download />
            Export code
          </Button>
          <UserButton />
        </div>
      </div>
      <TabsContent value="code" className=" p-4 overflow-hidden">
        <ComponentFileViewer
          component={{
            name: "Next.js Project",
            version: "1.0.0",
            files: projectData.files as any,
          }}
        />
      </TabsContent>
      <TabsContent value="preview">
        <div className="  rounded-md  flex flex-col h-full w-full ">
          <div className="flex items-center px-4  w-full h-16 border-b  justify-between">
            <div className=" rounded-md  w-[50%] border  bg-input gap-1 h-9 flex items-center">
              <button type="button" onClick={togglePreviewDevice}>
                <MonitorSmartphone className=" size-5 ml-2" />
              </button>
              <form onSubmit={handleSubmit} className=" w-full h-full">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-input focus-visible:ring-0 shadow-none focus-visible:border-none w-full   h-full"
                />
              </form>
            </div>
            <div className="flex gap-2">
              <button
                className=" hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={handleReload}
              >
                <RotateCw className="size-5 m-1 " />
              </button>
              <button
                className=" hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={openPreview}
              >
                <SquareArrowOutUpRight className="size-5 m-1 " />
              </button>
            </div>
          </div>
          <iframe
            src={projectData?.previewUrl!}
            className="h-full mx-auto transition-[width] duration-300 ease-in-out"
            style={{ width: previewDevice.width }}
            ref={iframe}
          ></iframe>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default EditorView;
