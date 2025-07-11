import { getSandbox } from "@/lib/getSandbox";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { createAgent, createNetwork, createTool } from "@inngest/agent-kit"; 
import { gemini, models } from "inngest";
import {z} from "zod";
import { lastAssistantTextMessage } from "@/lib/utils";
import { PROMPT } from "@/lib/prompt";

export const helloWorld = inngest.createFunction(
  { id: "generate-application" },
  { event: "generate-application" },
  async ({ event, step }) => {
    const sandboxId = await step.run("create-sandbox", async () => {
      const sandbox = await Sandbox.create("next-js-template");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-generator",
      system:PROMPT,
      model: models.gemini({ model: "gemini-2.5-flash" })  as any,
      tools:[

        createTool({
          name:"terminal",
          description:"Use terminal to run commands",
          parameters:z.object({
            command:z.string()
          }),
          async handler({command}, {network,step}) {
              await step?.run("run-command",async ()=>{
                const sandbox=await getSandbox(sandboxId);
                const buffers={
                  stdout:"",
                  stderr:""
                }
                try {
                  await sandbox.commands.run(command,
                    {
                      onStdout(data) {
                        buffers.stdout+=data;
                      },
                      onStderr(data) {
                        buffers.stderr+=data;
                      }
                    }
                  )
                  return buffers.stdout
                } catch (error) {
                  console.error(`Command failed : ${error} stdout: ${buffers.stdout} stderr: ${buffers.stderr}`)
                  return `Command failed : ${error} stdout: ${buffers.stdout} stderr: ${buffers.stderr}`
                }
              })
          },
        }),
        createTool({
          name:"createOrUpdateFile",
          description:"Create or update file",
          parameters:z.object({
            files:z.array(
              z.object({
                path:z.string(),
                content:z.string()
              })
            )
          }
          ),
          async handler({files}, {network,step}) { 
              const newFiles=await step?.run("Create or update file",async ()=>{
                try {
                  const sandbox=await getSandbox(sandboxId);
                  const updatedFiles =network.state.data.files ??{}
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path]=file.content
                  }
                  return updatedFiles
                } catch (error) {
                  return `Failed to create or update file: ${error}`
                }
              })
              if(typeof newFiles==='object'){
                network.state.data.files=newFiles
              }
          }
        }),
        createTool({
          name:"readFiles",
          description:"Read files from sandbox",
          parameters:z.object({
            files:z.array(z.string())
          }),
          async handler({files}, {network,step}) { 
            await step?.run("Read file",async ()=>{
              try {
                const sandbox=await getSandbox(sandboxId);
                const contents=[]
                for (const file of files) {
                  const content=await sandbox.files.read(file)
                  contents.push({file,content})
                }
                return JSON.stringify(contents)
              } catch (error) {
                return `Failed to read file: ${error}`
              }
            })
          
          }
        })
      ],
      lifecycle:{
        onResponse({result,network}) {
          const lastAssistantMessage=lastAssistantTextMessage(result)
          if(lastAssistantMessage  && network){
            if(lastAssistantMessage.includes("<task_summary>")){
                network.state.data.summary=lastAssistantMessage

            }
          }
          return result
        },
      },
    });

    const network= createNetwork({
      name:"code-agent-network",
      agents:[codeAgent],
      maxIter:15,
      router:async ({ network})=>{
        const summary=network.state.data.summary
        if(summary){
          return
        }
        return codeAgent
      }
    })

    const result=await network.run(event.data.value)

    const sandboxUrl=await step.run("get-sandbox-url",async ()=>{
      const sandbox=await getSandbox(sandboxId);  
      const host=await sandbox.getHost(3000)
      return `https://${host}/`
    })

    return {
      url:sandboxUrl,
      title:"Next js app",
      files:network.state.data.files,
      summary:network.state.data.summary
    }
  }
);
