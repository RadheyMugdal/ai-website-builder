import { lastAssistantTextMessage, updateOrCreateFile } from "@/lib/utils";
import { inngest } from "./client";
import { Daytona, Sandbox } from "@daytonaio/sdk";
import { createAgent, createNetwork, createTool } from "@inngest/agent-kit";
import z from "zod";

import { PROMPT } from "@/lib/prompt";
import { models } from "inngest";
import { db } from "@/db";
import { message, project } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TemplateFile } from "@/lib/template";

export const generateCode = inngest.createFunction(
  { id: "generate-code" },
  {
    event: "code/generate",
  },

  async ({ event, step, logger }) => {
    const daytona = new Daytona({
      apiKey: process.env.DAYTONA_API_KEY,
      apiUrl: process.env.DAYTONA_API_URL,
      target: "us",
    });

    let sandboxId: string;

    if (!event.data.sandboxId) {
      sandboxId = await step.run("create-sandbox", async () => {
        const sandbox = await daytona.create({
          snapshot: "test",
          autoStopInterval: 10,
          autoArchiveInterval: 10,
          public: true,
        });

        return sandbox.id;
      });
    } else {
      sandboxId = await step.run("ensure-sandbox-running", async () => {
        const sandbox = await daytona.get(event.data.sandboxId);
        if (sandbox.state === "stopped" || sandbox.state === "archived") {
          await daytona.start(sandbox);
        }
        return sandbox.id;
      });
    }

    const updateProject = await step.run("update-project", async () => {
      await db
        .update(project)
        .set({
          status: "generating",
          sandboxId,
        })
        .where(eq(project.id, event.data.projectId));
    });

    const codingAgent = createAgent({
      name: "Coding Agent",
      system: PROMPT,
      model: models.gemini({ model: "gemini-2.5-flash" }) as any,
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }) => {
            let stdout = "";
            try {
              const opt = await step.run("run-command", async () => {
                const sandbox = await daytona.get(sandboxId);
                const res = await sandbox.process.executeCommand(
                  command,
                  "/home/user/nextjs-app"
                );
                stdout += res.artifacts?.stdout ?? "";
              });
              return stdout;
            } catch (error) {
              console.error(`Commands failed: ${error} stdout: ${stdout}`);
              return `Command failed stdout: ${stdout}  error: ${error}`;
            }
          },
        }),
        createTool({
          name: "createOrUpdateFile",
          description: "Create or update a file",
          parameters: z.object({
            files: z.array(
              z.object({
                filePath: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { network }) => {
            const newFiles = await step.run(
              "create or update files",
              async () => {
                try {
                  const sandbox = await daytona.get(sandboxId);
                  const updatedFiles = network.state.data.files ?? [];
                  for (const file of files) {
                    const fileContent = Buffer.from(file.content);
                    await sandbox.fs.uploadFile(
                      fileContent,
                      `/home/user/nextjs-app/${file.filePath}`
                    );

                    updatedFiles.push({
                      path: file.filePath,
                      content: file.content,
                    });
                  }
                  return updatedFiles;
                } catch (error) {
                  console.error(`Failed to create or update files: ${error}`);
                  return `Failed to create or update files: ${error}`;
                }
              }
            );
            network.state.data.files = newFiles;
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files of project",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, network) => {
            const sandbox = await daytona.get(sandboxId);
            const contents = await step.run("read files", async () => {
              let contents = [];
              try {
                for (const file of files) {
                  const opt = await sandbox.fs.downloadFile(
                    `/home/user/nextjs-app/${file}`
                  );
                  contents.push(opt.toString());
                }
                return JSON.stringify(contents);
              } catch (error) {
                console.error(`Failed to read files: ${error}`);
                return `Failed to read files: ${error}`;
              }
            });
            return contents;
          },
        }),
      ],
      lifecycle: {
        onResponse({ result, network }) {
          const lastAssistantMessage = lastAssistantTextMessage(result);
          if (lastAssistantMessage && network) {
            if (lastAssistantMessage.includes("<task_summary>")) {
              const match = lastAssistantMessage.match(
                /<task_summary>([\s\S]*?)<\/task_summary>/
              );
              if (match && match[1]) {
                network.state.data.summary = match[1].trim();
              }
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: "code-agent-network",
      agents: [codingAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codingAgent;
      },
    });

    const previousConversations = await step.run(
      "get-previous-messages",
      async () => {
        const messages = await db
          .select()
          .from(message)
          .where(eq(message.projectId, event.data.projectId));
        return messages;
      }
    );

    const result = await network.run(
      event.data.prompt +
        `here is the conversation history: ${JSON.stringify(
          previousConversations
        )}`
    );

    const url = await step.run("preview-url", async () => {
      const sandbox = await daytona.get(sandboxId);
      const url = await sandbox.getPreviewLink(3000);
      return url;
    });

    await step.run("update-project-last", async () => {
      const [existingProject] = await db
        .select({
          files: project.files,
        })
        .from(project)
        .where(eq(project.id, event.data.projectId));
      let files = existingProject.files as TemplateFile[];
      result.state.data.files.forEach((file: TemplateFile) => {
        files = updateOrCreateFile(file, files);
      });

      const updatedProject = await db
        .update(project)
        .set({
          previewUrl: url.legacyProxyUrl,
          status: "running",
          files,
        })
        .where(eq(project.id, event.data.projectId));
      const updatedMessage = await db.insert(message).values({
        content: result.state.data.summary,
        role: "assistant",
        projectId: event.data.projectId,
      });
    });
  }
);
