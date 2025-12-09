import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
const createFileDef = toolDefinition({
    name: "create-file",
    description: "Create a new file with given path and content.",
    inputSchema: z.object({
        path: z.string(),
        content: z.string()
    }),
    outputSchema: z.object({
        success: z.boolean().describe("represents if tool execution was successful"),
        error: z.string().optional(),
        message: z.string().optional()
    })
})

const updateFileDef = toolDefinition({
    name: "update-file",
    description: "Update an existing file with given path and content.",
    inputSchema: z.object({
        path: z.string(),
        content: z.string()
    }),
    outputSchema: z.object({
        success: z.boolean().describe("represents if tool execution was successful"),
        error: z.string().optional(),
        message: z.string().optional()
    })
})

const removeFileOrDirectoryDef = toolDefinition({
    name: "remove-file",
    description: "Delete a file or directory at the given path.",
    inputSchema: z.object({
        path: z.string()
    }),
    outputSchema: z.object({
        success: z.boolean().describe("represents if tool execution was successful"),
        error: z.string().optional(),
        message: z.string().optional()
    })
})

const readFileDef = toolDefinition({
    name: "read-file",
    description: "Read the content of a file.",
    inputSchema: z.object({
        path: z.string()
    }),
    outputSchema: z.object({
        content: z.string().optional().describe("represents the content of the file"),
        error: z.string().optional(),
        message: z.string().optional()
    })
})

const listFilesDef = toolDefinition({
    name: "list-file",
    description: "List files and directories at given path",
    inputSchema: z.object({
        path: z.string()
    }),
    outputSchema: z.object({
        success: z.boolean().describe("represents if tool execution was successful"),
        files: z.array(z.any()).optional(),
        error: z.string().optional()
    })
})

const runCommandDef = toolDefinition({
    name: "run-command",
    description: "Run a terminal command.",
    inputSchema: z.object({
        command: z.string()
    }),
    outputSchema: z.object({
        success: z.boolean().describe("represents if tool execution was successful"),
        error: z.string().optional(),
        output: z.string().optional()
    })
})

const createDirectoryDef = toolDefinition({
    name: "create-directory",
    description: "Create a new directory at the given path.",
    inputSchema: z.object({
        path: z.string()
    }),
    outputSchema: z.object({
        success: z.boolean().describe("represents if tool execution was successful"),
        error: z.string().optional(),
        message: z.string().optional()
    })
})



export {
    createFileDef,
    updateFileDef,
    removeFileOrDirectoryDef,
    readFileDef,
    listFilesDef,
    runCommandDef,
    createDirectoryDef
}