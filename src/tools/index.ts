import { tool } from 'ai';
import { z } from 'zod';
import type { SandboxClient } from '@codesandbox/sdk';

/**
 * Get all tools configured for the given SandboxClient
 */
export function getTools(client: SandboxClient) {
  const createFileTool = tool({
    description: 'Create a new file with given path and content.',
    inputSchema: z.object({
      path: z.string().describe('The file path relative to project root'),
      content: z.string().describe('The content to write to the file')
    }),

    execute: async ({ path, content }) => {
      try {
        await client.fs.writeTextFile(`/project/sandbox/${path}`, content);
        return { success: true, message: `File created at "${path}"` };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Failed to create file' };
      }
    }
  });

  const updateFileTool = tool({
    description: 'Update an existing file with given path and content.',
    inputSchema: z.object({
      path: z.string().describe('The file path relative to project root'),
      content: z.string().describe('The new content for the file')
    }),
    execute: async ({ path, content }) => {
      try {
        await client.fs.writeTextFile(`/project/sandbox/${path}`, content);
        return { success: true, message: `File updated at "${path}"` };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Failed to update file' };
      }
    }
  });

  const removeFileTool = tool({
    description: 'Delete a file or directory at the given path.',
    inputSchema: z.object({
      path: z.string().describe('The file or directory path to delete')
    }),
    execute: async ({ path }) => {
      try {
        await client.fs.remove(`/project/sandbox/${path}`);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Failed to remove file/directory' };
      }
    }
  });

  const readFileTool = tool({
    description: 'Read the content of a file.',
    inputSchema: z.object({
      path: z.string().describe('The file path to read')
    }),
    execute: async ({ path }) => {
      try {
        const raw = await client.fs.readFile(`/project/sandbox/${path}`);
        const content = raw instanceof Uint8Array ? new TextDecoder('utf-8').decode(raw) : String(raw);
        return { content };
      } catch (error: any) {
        return { error: error?.message || 'Failed to read file' };
      }
    }
  });

  const listFilesTool = tool({
    description: 'List files and directories at given path.',
    inputSchema: z.object({
      path: z.string().describe('The directory path to list')
    }),
    execute: async ({ path }) => {
      try {
        const files = await client.fs.readdir(`/project/sandbox/${path}`);
        return { success: true, files };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Failed to list files' };
      }
    }
  });

  const runCommandTool = tool({
    description: 'Run a terminal command in the sandbox.',
    inputSchema: z.object({
      command: z.string().describe('The command to execute')
    }),
    execute: async ({ command }) => {
      try {
        const output = await client.commands.run(command);
        return { success: true, output };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Command execution failed' };
      }
    }
  });

  const createDirectoryTool = tool({
    description: 'Create a new directory at the given path.',
    inputSchema: z.object({
      path: z.string().describe('The directory path to create')
    }),
    execute: async ({ path }) => {
      try {
        await client.fs.mkdir(`/project/sandbox/${path}`);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Failed to create directory' };
      }
    }
  });

  return {
    createFile: createFileTool,
    updateFile: updateFileTool,
    removeFile: removeFileTool,
    readFile: readFileTool,
    listFiles: listFilesTool,
    runCommand: runCommandTool,
    createDirectory: createDirectoryTool
  };
}
