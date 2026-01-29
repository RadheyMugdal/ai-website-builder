import { CodeSandbox } from "@codesandbox/sdk";
import { NextRequest, NextResponse } from "next/server";
import { convertToModelMessages, stepCountIs, streamText, validateUIMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { PROMPT } from "@/lib/prompt";
import { getTools } from "@/tools";
import { consumeCredits, getUsageStatus } from "@/lib/usage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";
import { trpc } from "@/trpc/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { data, messages ,userId} = await req.json();
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: Object.fromEntries(requestHeaders.entries())
    });

    if (!session?.user || !session.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usage = await getUsageStatus(session.user.id);
    if (usage.credits <= 0) {
      return NextResponse.json({ error: "Not enough credits" }, { status: 400 });
    }

    if (!messages) {
      return NextResponse.json({ error: "Messages is required" }, { status: 400 });
    }

    if (!data?.sandboxId) {
      return NextResponse.json({ error: "Sandbox Id is required" }, { status: 400 });
    }

    const csb_api_key = process.env.CODESANDBOX_KEY;
    if (!csb_api_key) {
      return NextResponse.json({ error: "CodeSandbox API key not configured" }, { status: 500 });
    }

    const openRouterApiKey = process.env.OPENAI_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 });
    }

    const sdk = new CodeSandbox(csb_api_key);
    const sandbox = await sdk.sandboxes.resume(data.sandboxId);
    const client = await sandbox.connect();

    if (!client) {
      return NextResponse.json({ error: "Failed to connect to sandbox" }, { status: 500 });
    }

    // Get tools configured with the sandbox client
    const tools = getTools(client);

    // Create model with OpenRouter configuration (OpenAI-compatible)
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openRouterApiKey,
      name: "openrouter"
    });
    const model = openrouter.chat(process.env.OPENAI_MODEL || "openai/gpt-4o");

    const validatedMessages = await validateUIMessages({
      messages,
      tools: tools as Parameters<typeof validateUIMessages>[0]["tools"]
    });


    // Stream the AI response with tool calling support
    const result = streamText({
      model,
      tools,
      stopWhen: stepCountIs(20),    
      system: PROMPT,
      messages: await convertToModelMessages(validatedMessages)
    });

    // Return a UI message stream response that DefaultChatTransport can parse
    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onError: (err) => (err instanceof Error ? err.message : "Unknown error"),
      onFinish: async ({ messages }) => {
        await db.update(project).set({ messages }).where(eq(project.id, data.projectId));
        await consumeCredits(data.userId)
      },
    });

  } catch (error) {
    console.error("❌ POST handler error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
