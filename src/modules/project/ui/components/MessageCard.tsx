"use client";

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UIMessage } from "@tanstack/ai-react";
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
      themes: ["github-dark"], // You can change this to 'vitesse-dark', 'dracula', etc.
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
  className,
}: {
  language: string;
  code: string;
  className?: string;
}) => {
  const [html, setHtml] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    const highlight = async () => {
      try {
        const highlighter = await getHighlighter();
        // Check if language is loaded, fallback to text if not
        const loadedLangs = highlighter.getLoadedLanguages();
        const langToUse = loadedLangs.includes(language) ? language : "text";

        const out = highlighter.codeToHtml(code, {
          lang: langToUse,
          theme: "github-dark",
        });

        if (mounted) setHtml(out);
      } catch (err) {
        console.error("Shiki error:", err);
        // Fallback to basic display if shiki fails
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

  // While waiting for Shiki, render a basic pre/code block to prevent layout shift
  if (!html) {
    return (
      <div className="relative my-4 rounded-lg border bg-[#0d1117] p-4 text-sm text-white/80 font-mono">
        {code}
      </div>
    );
  }

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-border/50">
      {/* Header with Language & Copy Button */}
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

      {/* Shiki Output (dangerouslySetInnerHTML is safe here because Shiki escapes input) */}
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
  console.log(parsedArgs)
  const getToolConfig = (toolName: string) => {
    switch (toolName) {
      case "create-file": return { icon: FilePlus, label: "Create File", color: "text-green-500" };
      case "remove-file": return { icon: FileMinus, label: "Remove File", color: "text-red-500" };
      case "update-file": return { icon: FilePen, label: "Update File", color: "text-blue-500" };
      case "read-file": return { icon: FileSearch, label: "Read File", color: "text-orange-500" };
      case "list-file": return { icon: FileSearch, label: "List Files", color: "text-indigo-500" };
      case "run-command": return { icon: Terminal, label: "Run Command", color: "text-purple-500" };
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

// --- Main Assistant Card ---
const AssistantMessageCard = ({ message, isLoading }: { message: UIMessage<any>, isLoading?: boolean }) => {
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
          {isLoading && message.parts.length === 0 && (
            <span className=" text-xs text-muted-foreground">🧠 Processing your request...</span>
          )}
          {message.parts.map((part, idx) => {
            if (part.type === "thinking") {
              return <ThinkingProcess key={`thinking-${idx}`} content={part.content} />;
            }

            if (part.type === "tool-call") {
              return (
                <ToolCall
                  key={`tool-${idx}`}
                  name={part.name || "unknown"}
                  args={part.arguments}
                />
              );
            }

            if (part.type === "text") {
              return (
                <div key={`text-${idx}`} className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom Code Component for Shiki
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const isMatch = !!match;
                        const content = String(children).replace(/\n$/, "");

                        if (isMatch) {
                          // Block Code -> Use Shiki
                          return (
                            <CodeBlock
                              language={match[1]}
                              code={content}
                            />
                          );
                        }

                        // Inline Code -> Simple styled span
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
                      // Basic styles for links
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
                    {part.content}
                  </ReactMarkdown>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};

// --- Main User Card ---
const MessageCard = ({ message }: { message: UIMessage<any> }) => {
  return (
    <div className="flex w-full justify-end mb-6">
      <div className="bg-primary text-primary-foreground px-4 py-3 max-w-[85%] text-sm rounded-2xl rounded-tr-none shadow-sm">
        {message.parts.map((part, idx) => {
          if (part.type === "text") {
            return (
              <div key={`text-${idx}`} className="whitespace-pre-wrap">
                {part.content}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export { MessageCard, AssistantMessageCard };