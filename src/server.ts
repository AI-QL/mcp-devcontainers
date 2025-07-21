import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    LoggingLevel,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { devUp, devRunUserCommands, devExec } from "./devcontainer.js"

type ToolInput =  Tool['inputSchema']

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
const STDIO_FILE_PATH = "Path for output logs (string)"
const COMMAND = "Command to execute (array of string)"

const DevUpSchema = z.object({
  workspaceFolder: z.string().describe(WS_FOLDER_DESC),
  stdioFilePath: z.string().describe(STDIO_FILE_PATH),
});

const DevRunSchema = z.object({
  workspaceFolder: z.string().describe(WS_FOLDER_DESC),
  stdioFilePath: z.string().describe(STDIO_FILE_PATH),
});

const DevExecSchema = z.object({
  workspaceFolder: z.string().describe(WS_FOLDER_DESC),
  stdioFilePath: z.string().describe(STDIO_FILE_PATH),
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

    const logLevel: LoggingLevel = "debug";

    const messages = [
        { level: "debug", data: "Debug-level message" },
        { level: "info", data: "Info-level message" },
        { level: "notice", data: "Notice-level message" },
        { level: "warning", data: "Warning-level message" },
        { level: "error", data: "Error-level message" },
        { level: "critical", data: "Critical-level message" },
        { level: "alert", data: "Alert level-message" },
        { level: "emergency", data: "Emergency-level message" },
    ];

    const isMessageIgnored = (level: LoggingLevel): boolean => {
        const currentLevel = messages.findIndex((msg) => logLevel === msg.level);
        const messageLevel = messages.findIndex((msg) => level === msg.level);
        return messageLevel < currentLevel;
    };

    const logsUpdateInterval: NodeJS.Timeout = setInterval(() => {
        const message = {
            method: "notifications/message",
            params: messages[Math.floor(Math.random() * messages.length)],
        };
        if (!isMessageIgnored(message.params.level as LoggingLevel))
            server.notification(message);
    }, 20000);

    // Set up update interval for stderr messages
    const stdErrUpdateInterval: NodeJS.Timeout = setInterval(() => {
        const shortTimestamp = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        server.notification({
            method: "notifications/stderr",
            params: { content: `${shortTimestamp}: A stderr message` },
        });
    }, 30000);


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
        if (logsUpdateInterval) clearInterval(logsUpdateInterval);
        if (stdErrUpdateInterval) clearInterval(stdErrUpdateInterval);
    };

    return { server, cleanup };

}