import { CodeSandbox } from "@codesandbox/sdk";
import { NextRequest, NextResponse } from "next/server";
const csb_api_key = process.env.CODESANDBOX_KEY
const sdk = new CodeSandbox(`${csb_api_key}`);

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { message: "Missing sandbox id" },
                { status: 400 }
            );
        }

        const sandbox = await sdk.sandboxes.resume(id);
        const session = await sandbox.createSession({

        });

        return NextResponse.json({ session }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to get sandbox session" },
            { status: 500 }
        );
    }
}
