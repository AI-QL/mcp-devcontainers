import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { devUp, devRunUserCommands, devExec, NULL_DEVICE } from "./devcontainer.js"

type ToolInput = Tool['inputSchema']

enum ToolName {
    DEV_UP = "devcontainer_up",
    DEV_RUN = "devcontainer_run_user_commands",
    DEV_EXEC = "devcontainer_exec"
}

const ToolDescriptions = {
    [ToolName.DEV_UP]: "Initializes and starts a devcontainer environment in the specified workspace folder. Ensures the devcontainer is operational and ready for development tasks.",
    [ToolName.DEV_RUN]: "Executes user-defined postCreateCommand and postStartCommand scripts within the devcontainer for the specified workspace. Use this to run setup or initialization tasks after container startup.",
    [ToolName.DEV_EXEC]: "Runs a custom shell command inside the devcontainer for the specified workspace. Useful for executing arbitrary commands or scripts within the devcontainer environment."
};

const WS_FOLDER_DESC = "Path to the workspace folder (string)"
const STDIO_FILE_PATH = `Path for output logs (string), default is ${NULL_DEVICE}`
const COMMAND = "Command to execute (array of string)"

const DevUpSchema = z.object({
    workspaceFolder: z.string().describe(WS_FOLDER_DESC),
    stdioFilePath: z.string().describe(STDIO_FILE_PATH).optional(),
});

const DevRunSchema = z.object({
    workspaceFolder: z.string().describe(WS_FOLDER_DESC),
    stdioFilePath: z.string().describe(STDIO_FILE_PATH).optional(),
});

const DevExecSchema = z.object({
    workspaceFolder: z.string().describe(WS_FOLDER_DESC),
    stdioFilePath: z.string().describe(STDIO_FILE_PATH).optional(),
    command: z.array(z.string()).min(1).describe(COMMAND)
});

export const createServer = () => {

    const server = new Server(
        {
            name: "mcp-devcontainers",
            version: "0.1.0",
        },
        {
            capabilities: {
                tools: {},
                logging: {}
            }
        }
    );

    const subscriptions = new Set<string>();

    // Set up update interval for subscribed resources
    const subsUpdateInterval: NodeJS.Timeout = setInterval(() => {
        for (const uri of subscriptions) {
            server.notification({
                method: "notifications/resources/updated",
                params: { uri },
            });
        }
    }, 10000);

    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const tools: Tool[] = [
            {
                name: ToolName.DEV_UP,
                description: ToolDescriptions[ToolName.DEV_UP],
                inputSchema: zodToJsonSchema(DevUpSchema) as ToolInput,
            },
            {
                name: ToolName.DEV_RUN,
                description: ToolDescriptions[ToolName.DEV_RUN],
                inputSchema: zodToJsonSchema(DevRunSchema) as ToolInput,
            },
            {
                name: ToolName.DEV_EXEC,
                description: ToolDescriptions[ToolName.DEV_EXEC],
                inputSchema: zodToJsonSchema(DevExecSchema) as ToolInput,
            }
        ];

        return { tools };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        switch (name) {
            case ToolName.DEV_UP: {
                const validatedArgs = DevUpSchema.parse(args);
                const result = await devUp(validatedArgs);
                return {
                    content: [
                        { type: "text", text: `Devcontainer Up result: ${result}` },
                    ],
                };
            }
            case ToolName.DEV_RUN: {
                const validatedArgs = DevRunSchema.parse(args);
                const result = await devRunUserCommands(validatedArgs);
                return {
                    content: [
                        { type: "text", text: `Devcontainer Run User Commands result: ${result}` },
                    ],
                };
            }
            case ToolName.DEV_EXEC: {
                const validatedArgs = DevExecSchema.parse(args);
                const result = await devExec(validatedArgs);
                return {
                    content: [
                        { type: "text", text: `Dev Exec result: ${result}` },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    });



    const cleanup = async () => {
        if (subsUpdateInterval) clearInterval(subsUpdateInterval);
    };

    return { server, cleanup };

}