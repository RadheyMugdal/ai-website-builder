"use server";
import { CodeSandbox } from "@codesandbox/sdk";
import { NextRequest, NextResponse } from "next/server";
import { chat, maxIterations, toStreamResponse } from "@tanstack/ai";
import { openai, OpenAIConfig } from "@tanstack/ai-openai";
import { PROMPT } from "@/lib/prompt";
import { getTools } from "@/tools/server";
import { getUsageStatus } from "@/lib/usage";

const config: OpenAIConfig = {
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: "https://openrouter.ai/api/v1"
};

export async function POST(req: NextRequest) {
    try {
        const { data, messages } = await req.json();
        const usage = await getUsageStatus(data.userId)
        if (usage.credits <= 0) {
            return NextResponse.json({ error: "Not enough credits" }, { status: 400 });
        }
        if (!messages) return NextResponse.json({ error: "Messages is required" }, { status: 400 });
        if (!data.sandboxId) return NextResponse.json({ error: "Sandbox Id is required" }, { status: 400 });
        const csb_api_key = process.env.CODESANDBOX_KEY;
        const sdk = new CodeSandbox(csb_api_key);
        const sandbox = await sdk.sandboxes.resume(data.sandboxId);
        const client = await sandbox.connect();

        if (!client) {
            return NextResponse.json({ error: "Failed to connect to sandbox" }, { status: 500 });
        }
        const adapter = openai(config);

        // -----------------------------
        // TOOLS WITH LOGGING WRAPPED
        // -----------------------------

        const prompt = PROMPT

        const tools = getTools(client)
        const stream = chat({
            adapter,
            //@ts-ignore
            model: process.env.OPENAI_MODEL,
            tools: tools,
            agentLoopStrategy: maxIterations(20),
            messages: [
                {
                    role: "system",
                    content: prompt,
                },
                ...messages
            ],


        });

        return toStreamResponse(stream)
    } catch (error) {
        console.error("❌ POST handler error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
