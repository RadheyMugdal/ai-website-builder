import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Sandbox from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function getSandbox(sandboxId: string) {
    const sandbox=await Sandbox.connect(sandboxId);
    return sandbox;
}

export function lastAssistantTextMessage(result:AgentResult){
  const lastAssistantTextMessageIndex=result.output.findLastIndex(message=>message.role==="assistant")
  const message=result.output[lastAssistantTextMessageIndex] as TextMessage |undefined

  return message?.content ?  typeof message.content==="string"?message.content:message.content.join(""):undefined


}

