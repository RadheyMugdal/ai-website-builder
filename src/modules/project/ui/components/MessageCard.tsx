"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createHighlighter, Highlighter } from "shiki";
import {
  FilePen,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileSearch,
  FilePlus,
  FileMinus,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Shiki Singleton (Avoids re-fetching heavy WASM/JSON on every render) ---
let highlighterPromise: Promise<Highlighter> | null = null;

const getHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: [
        "javascript", "typescript", "tsx", "jsx",
        "json", "html", "css", "python", "bash",
        "sql", "markdown", "yaml"
      ],
    });
  }
  return highlighterPromise;
};

// --- Sub-Component: Code Block (Uses Shiki) ---
const CodeBlock = ({
  language,
  code,
}: {
  language: string;
  code: string;
}) => {
  const [html, setHtml] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    const highlight = async () => {
      try {
        const highlighter = await getHighlighter();
        const loadedLangs = highlighter.getLoadedLanguages();
        const langToUse = loadedLangs.includes(language) ? language : "text";

        const out = highlighter.codeToHtml(code, {
          lang: langToUse,
          theme: "github-dark",
        });

        if (mounted) setHtml(out);
      } catch (err) {
        console.error("Shiki error:", err);
        if (mounted) setHtml(`<pre class="shiki bg-[#0d1117] p-4"><code>${code}</code></pre>`);
      }
    };

    highlight();

    return () => {
      mounted = false;
    };
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!html) {
    return (
      <div className="relative my-4 rounded-lg border bg-[#0d1117] p-4 text-sm text-white/80 font-mono">
        {code}
      </div>
    );
  }

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-border/50">
      <div className="flex items-center justify-between bg-[#1f242c] px-4 py-2 text-xs text-muted-foreground border-b border-border/50">
        <span className="font-mono">{language || "text"}</span>
        <button
          onClick={handleCopy}
          className="hover:text-white transition-colors"
          title="Copy code"
        >
          {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      <div
        className="text-sm overflow-x-auto [&>pre]:!bg-[#0d1117] [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:!font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

// --- Sub-Component: Thinking Process (Collapsible) ---
const ThinkingProcess = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 rounded-lg border bg-muted/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <Lightbulb size={14} className={cn(isOpen ? "text-yellow-500" : "")} />
        <span>Thinking Process</span>
        <span className="ml-auto">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {isOpen && (
        <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-background/50 animate-in slide-in-from-top-2 duration-200">
          <div className="whitespace-pre-wrap font-mono opacity-90">{content}</div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Tool Call ---
const ToolCall = ({ name, args }: { name: string; args: string }) => {
  let parsedArgs: any = {};
  try {
    parsedArgs = JSON.parse(args);
  } catch (e) {
    // Fallback
  }

  const getToolConfig = (toolName: string) => {
    switch (toolName) {
      case "createFile": return { icon: FilePlus, label: "Create File", color: "text-green-500" };
      case "removeFile": return { icon: FileMinus, label: "Remove File", color: "text-red-500" };
      case "updateFile": return { icon: FilePen, label: "Update File", color: "text-blue-500" };
      case "readFile": return { icon: FileSearch, label: "Read File", color: "text-orange-500" };
      case "listFiles": return { icon: FileSearch, label: "List Files", color: "text-indigo-500" };
      case "runCommand": return { icon: Terminal, label: "Run Command", color: "text-purple-500" };
      case "createDirectory": return { icon: FilePlus, label: "Create Directory", color: "text-green-500" };
      default: return { icon: RefreshCw, label: "Function Call", color: "text-gray-500" };
    }
  };

  const config = getToolConfig(name);
  const Icon = config.icon;
  const displayPath = parsedArgs.path || parsedArgs.command || "Unknown target";

  return (
    <div className="flex items-center gap-3 p-2 my-2 rounded-md border bg-card/50 text-card-foreground text-xs font-medium shadow-sm">
      <div className={cn("p-1.5 rounded-md bg-secondary", config.color)}>
        <Icon size={14} />
      </div>
      <div className="flex flex-col">
        <span className="text-muted-foreground uppercase tracking-wider text-[10px]">{config.label}</span>
        <span className="font-mono truncate max-w-[200px] sm:max-w-[300px]">{displayPath}</span>
      </div>
      <div className="ml-auto pr-2">
        <CheckCircle2 size={14} className="text-muted-foreground/40" />
      </div>
    </div>
  );
};

function extractText(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function extractReasoning(message: UIMessage): string | undefined {
  const reasoning = message.parts
    .filter((p) => p.type === "reasoning")
    .map((p) => p.text)
    .join("")
    .trim();

  return reasoning || undefined;
}

function extractToolCalls(message: UIMessage): Array<{ name: string; args: string }> {
  const out: Array<{ name: string; args: string }> = [];

  for (const part of message.parts) {
    // Tool parts are either typed (`tool-${name}`) or `dynamic-tool`.
    if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
      const toolName =
        "toolName" in part ? String(part.toolName) : String(part.type.slice("tool-".length));

      const input =
        "input" in part ? (part as { input?: unknown }).input : undefined;

      out.push({
        name: toolName,
        args: JSON.stringify(input ?? {}, null, 2),
      });
    }
  }

  return out;
}

// --- Main Assistant Card ---
const AssistantMessageCard = ({
  message,
  isLoading,
}: {
  message: UIMessage;
  isLoading?: boolean;
}) => {
  const textContent = extractText(message).trim();
  const reasoning = extractReasoning(message);
  const toolCalls = extractToolCalls(message);

  return (
    <div className="flex gap-4 w-full max-w-3xl group items-start mb-6">
      <Avatar className="mt-1 h-8 w-8 border">
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
          AI
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col w-full min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-semibold text-sm">Wavely</span>
          <span className="text-[10px] text-muted-foreground">Assistant</span>
        </div>

        <div className="text-sm leading-relaxed">
          {isLoading && !textContent && (
            <span className="text-xs text-muted-foreground">Processing your request...</span>
          )}

          {reasoning && <ThinkingProcess content={reasoning} />}

          {toolCalls.map((toolCall, idx) => (
            <ToolCall
              key={`tool-${idx}`}
              name={toolCall.name}
              args={toolCall.args}
            />
          ))}

          {textContent && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isMatch = !!match;
                    const content = String(children).replace(/\n$/, "");

                    if (isMatch) {
                      return (
                        <CodeBlock
                          language={match[1]}
                          code={content}
                        />
                      );
                    }

                    return (
                      <code
                        className={cn(
                          "bg-muted px-1.5 py-0.5 rounded-md font-mono text-xs text-foreground font-semibold border",
                          className
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  a({ children, href }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {textContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main User Card ---
const MessageCard = ({ message }: { message: UIMessage }) => {
  const content = extractText(message);

  return (
    <div className="flex w-full justify-end mb-6">
      <div className="bg-primary text-primary-foreground px-4 py-3 max-w-[85%] text-sm rounded-2xl rounded-tr-none shadow-sm">
        <div className="whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
};

export { MessageCard, AssistantMessageCard };
