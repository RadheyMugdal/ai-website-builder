import { AgentResult, TextMessage } from "@inngest/agent-kit";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TemplateFile } from "./template";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function lastAssistantTextMessage(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant"
  );
  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;

  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.join("")
    : undefined;
}

export function updateOrCreateFile(file: TemplateFile, files: TemplateFile[]) {
  const existingFile = files.find((f) => f.path === file.path);
  if (existingFile) {
    return [
      ...files,
      {
        ...existingFile,
        content: file.content,
      },
    ];
  } else {
    return [...files, file];
  }
}

export function removeFile(file: TemplateFile, files: TemplateFile[]) {
  return files.filter((f) => f.path !== file.path);
}
