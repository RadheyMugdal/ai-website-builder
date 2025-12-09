import { SandboxClient } from "@codesandbox/sdk";
import { createDirectoryDef, createFileDef, listFilesDef, readFileDef, removeFileOrDirectoryDef, runCommandDef, updateFileDef } from "@/tools/definitions";


export function getTools(client: SandboxClient) {
    if (!client) {
        throw new Error("Client is required")

    }
    const createFileTool = createFileDef.server(async ({ path, content }) => {

        try {
            await client.fs.writeTextFile(path, content);
            const result = { success: true, message: `File created at "${path}"` };

            return result;
        } catch (error: any) {
            const result = { success: false, error: error?.message };

            return result;
        }
    });

    const updateFileTool = updateFileDef.server(async ({ path, content }) => {
        try {
            await client.fs.writeTextFile(path, content);
            const result = { success: true, message: `File updated at "${path}"` };
            return result;
        } catch (error: any) {
            const result = { success: false, error: error?.message };
            return result;
        }
    });

    const removeFileOrDirectoryTool = removeFileOrDirectoryDef.server(async ({ path }) => {
        try {
            await client.fs.remove(path);
            const result = { success: true };
            return result;
        } catch (error: any) {
            const result = { success: false, error: error?.message };
            return result;
        }
    });

    const readFileTool = readFileDef.server(async ({ path }) => {
        try {
            const raw = await client.fs.readFile(path);
            const content = raw instanceof Uint8Array ? new TextDecoder("utf-8").decode(raw) : String(raw);
            const result = { content };
            return result;
        } catch (error: any) {
            const result = { error: error?.message };
            return result;
        }
    });

    const listFilesTool = listFilesDef.server(async ({ path }) => {
        try {
            const files = await client.fs.readdir(path);
            const result = { success: true, files };
            return result;
        } catch (error: any) {
            const result = { success: false, error: error?.message };
            return result;
        }
    });

    const runCommandTool = runCommandDef.server(async ({ command }) => {
        try {
            const output = await client.commands.run(command);
            const result = { success: true, output };
            return result;
        } catch (error: any) {
            const result = { success: false, error: error?.message };
            return result;
        }
    });

    const createDirTool = createDirectoryDef.server(async ({ path }) => {
        try {
            await client.fs.mkdir(path);
            const result = { success: true };
            return result;
        } catch (error: any) {
            const result = { success: false, error: error?.message };
            return result;
        }
    });

    return [
        createFileTool,
        updateFileTool,
        removeFileOrDirectoryTool,
        readFileTool,
        listFilesTool,
        runCommandTool,
        createDirTool
    ]

}