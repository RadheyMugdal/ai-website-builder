import React, { useEffect, useRef, useState } from "react";
import { ProjectData } from "../../schema";
import ComponentFileViewer from "@/components/global/file-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code,
  Download,
  Eye,
  MonitorSmartphone,
  RotateCw,
  SquareArrowOutUpRight,
} from "lucide-react";
import { previewDevices } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import UserButton from "@/components/global/user-button";
import { exportCode } from "@/lib/export-code";
import { toast } from "sonner";
import { SandboxClient, Watcher } from "@codesandbox/sdk";
import { createPreview } from "@codesandbox/sdk/browser";
import { Input } from "@/components/ui/input";

const EditorView = ({
  projectData,
  client,
}: {
  projectData: ProjectData;
  client: SandboxClient;
}) => {
  const [url, setUrl] = React.useState("");
  const [previewDevice, setPreviewDevice] = React.useState(previewDevices[0]);
  const [isExporting, setIsExporting] = useState(false);

  const [projectFiles, setProjectFiles] = useState<
    { path: string; content: string }[]
  >([]);

  // iframe URL input
  const [iframeInpoutUrl, setIframeInputUrl] = useState("/");

  // NEW: iframe reference
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const openPreview = () => {
    window.open(projectData.previewUrl!, "_blank");
  };

  const handleReload = () => {
    const iframe = iframeRef.current;
    if (iframe) iframe.src = iframe.src;
  };

  const togglePreviewDevice = () => {
    setPreviewDevice(
      previewDevices[
      (previewDevices.indexOf(previewDevice) + 1) % previewDevices.length
      ]
    );
  };

  //
  // --------------------------------------------------
  // START DEV SERVER
  // --------------------------------------------------
  //
  useEffect(() => {
    if (!client) return;

    async function startDevServer() {
      const alreadyrunningPort = await client.ports.get(3000);
      if (alreadyrunningPort) {
        const srcUrl = await client.hosts.getUrl(
          alreadyrunningPort.port as number
        );
        setUrl(srcUrl);
        return;
      }

      client.commands.runBackground("npm i && npm run dev");
      const port = await client.ports.waitForPort(3000);
      const srcUrl = await client.hosts.getUrl(port?.port as number);
      setUrl(srcUrl);
    }

    startDevServer();
  }, [client]);

  //
  // EXPORT LOGIC
  //
  const handleQuickExport = async () => {
    try {
      setIsExporting(true);
      await exportCode(projectFiles);
      toast.success("Project exported successfully!");
    } catch {
      toast.error("Failed to export project");
    } finally {
      setIsExporting(false);
    }
  };

  //
  // extract files recursively
  //
  useEffect(() => {
    if (!client) return;

    const extractFiles = async () => {
      const decoder = new TextDecoder("utf-8");

      const normalizePath = (filePath: string) =>
        filePath.replace(/\\/g, "/");

      const readDirectory = async (dirPath: string) => {
        const entries = await client.fs.readdir(dirPath);

        for (const entry of entries) {
          if (
            entry.name.includes(".next") ||
            entry.name.includes("node_modules") ||
            entry.name.includes(".git") ||
            entry.name.includes(".codesandbox") ||
            entry.name.includes(".devcontainer")
          )
            continue;

          const fullPath =
            dirPath === "./" ? entry.name : `${dirPath}/${entry.name}`;

          if (entry.type === "directory") {
            await readDirectory(fullPath);
          } else {
            try {
              const uint8 = await client.fs.readFile(fullPath);
              const content = decoder.decode(uint8);

              setProjectFiles((prev) => [
                ...prev,
                { path: normalizePath(fullPath), content },
              ]);
            } catch (err) {
              console.error("Failed reading file:", fullPath, err);
            }
          }
        }
      };

      await readDirectory("./");
    };

    extractFiles();
  }, [client]);

  //
  // FILE WATCHER
  //
  useEffect(() => {
    if (!client) return;
    let watcher: Watcher;
    const decoder = new TextDecoder("utf-8");

    const normalizePath = (p: string) =>
      p.replace(/^\/project\/sandbox\//, "").replace(/^\/+/, "");

    const ignored = (p: string) =>
      p.includes(".next") ||
      p.includes("node_modules") ||
      p.includes(".git") ||
      p.includes(".codesandbox");

    const addEventListenerOnFileChange = async () => {
      watcher = await client.fs.watch("./", {
        recursive: true,
        excludes: [
          "node_modules",
          ".next",
          "/project/sandbox/node_modules",
          "/project/sandbox/.next",
        ],
      });

      watcher.onEvent(async (event) => {
        for (let rawPath of event.paths) {
          if (ignored(rawPath)) continue;

          const path = normalizePath(rawPath);

          if (event.type === "change") {
            try {
              const uint8 = await client.fs.readFile(rawPath);
              const updatedContent = decoder.decode(uint8);

              setProjectFiles((prev) =>
                prev.map((f) =>
                  f.path === path ? { ...f, content: updatedContent } : f
                )
              );
            } catch (err) {
              console.error("Failed to read changed file", rawPath, err);
            }
          }

          if (event.type === "remove") {
            setProjectFiles((prev) => prev.filter((f) => f.path !== path));
          }

          if (event.type === "add") {
            try {
              const uint8 = await client.fs.readFile(rawPath);
              const fileContent = decoder.decode(uint8);

              setProjectFiles((prev) => {
                if (prev.some((f) => f.path === path)) return prev;
                return [...prev, { path, content: fileContent }];
              });
            } catch (err) {
              console.error("Failed to read added file", rawPath, err);
            }
          }
        }
      });
    };

    addEventListenerOnFileChange();
    return () => watcher?.dispose();
  }, [client]);

  //
  // --------------------------------------------------
  // NEW: Sync iframe → input (detect route changes)
  // --------------------------------------------------
  //
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const updateUrl = () => {
      try {
        const pathname = iframe.contentWindow?.location.pathname;
        if (pathname) setIframeInputUrl(pathname);
      } catch { }
    };

    iframe.onload = updateUrl;

    // Detect client-side navigation inside iframe
    const interval = setInterval(updateUrl, 300);

    return () => clearInterval(interval);
  }, [url]);



  //
  // RENDER
  //
  return (
    <Tabs className="w-full h-full flex flex-col" defaultValue="code">
      <div className="h-12 px-4 border-b flex items-center justify-between w-full">
        <TabsList>
          <TabsTrigger value="code">
            <Code />
          </TabsTrigger>

          <TabsTrigger value="preview">
            <Eye />
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleQuickExport}
            disabled={isExporting}
          >
            <Download /> Export Project
          </Button>

          <UserButton />
        </div>
      </div>

      <TabsContent value="code" className="p-4 h-full overflow-hidden">
        <ComponentFileViewer
          component={{
            name: "Next.js Project",
            version: "1.0.0",
            files: projectFiles,
          }}
        />
      </TabsContent>

      <TabsContent value="preview" className="flex flex-col h-full w-full">
        {/* TOP BAR */}
        <div className="flex items-center px-4 w-full h-16 border-b justify-between">
          <div className="rounded-md w-[50%] border bg-input gap-1 h-9 flex items-center">
            <button type="button" onClick={togglePreviewDevice}>
              <MonitorSmartphone className="size-5 ml-2" />
            </button>

            {/* USER CAN TYPE ROUTE */}
            <Input
              value={iframeInpoutUrl}
              onChange={(e) => setIframeInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setUrl((prev) => prev + iframeInpoutUrl)
                }
              }}
              className="focus-visible:ring-0 focus-visible:border-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              className="hover:bg-accent hover:text-accent-foreground rounded-md"
              onClick={handleReload}
            >
              <RotateCw className="size-5 m-1" />
            </button>

            <button
              className="hover:bg-accent hover:text-accent-foreground rounded-md"
              onClick={openPreview}
            >
              <SquareArrowOutUpRight className="size-5 m-1" />
            </button>
          </div>
        </div>

        {/* IFRAME */}
        {url ? (
          <iframe
            ref={iframeRef}
            src={url}
            className="flex-1 mx-auto transition-all duration-300 w-full relative overflow-hidden bg-black/5"
            style={{
              width: previewDevice.width,
            }}
          ></iframe>
        ) : (
          <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden bg-black/5">
            <p className="text-sm font-semibold text-muted-foreground">
              Your preview will appear here
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default EditorView;
