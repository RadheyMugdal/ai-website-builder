import { AgentResult, TextMessage } from "@inngest/agent-kit";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


import { addMilliseconds, format } from 'date-fns';

export function formatMsAsFutureDate(ms: number) {
  const futureDate = addMilliseconds(new Date(), ms || 0);
  // Format like "12 Jan, 2026"
  return format(futureDate, 'dd MMM, yyyy');
}


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

export type PreviewDevice = {
  name: string;
  width: string;
};

export const previewDevices: PreviewDevice[] = [
  {
    name: "Desktop",
    width: "100%",
  },
  {
    name: "Tablet",
    width: "60%",
  },
  {
    name: "Mobile",
    width: "40%",
  },
];
