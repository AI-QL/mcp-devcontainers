import { Server } from "@modelcontextprotocol/sdk/server/index.js";

import { zodToJsonSchema } from "zod-to-json-schema";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tool, CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { devUp, devRunUserCommands, devExec } from "./devcontainer.js";

import { DevUpSchema, DevRunSchema, DevExecSchema } from "./devcontainer.js";

import { devCleanup, devList, devWsFolder } from "./docker.js";
import {
  DevCleanupSchema,
  DevListSchema,
  DevWsFolderSchema,
} from "./docker.js";

type ToolInput = Tool["inputSchema"];
type ToolName = keyof typeof ToolMap;
type ToolArgs = CallToolRequest["params"]["arguments"];

const ToolMap = {
  devcontainer_up: {
    description:
      "Initializes and starts a devcontainer environment in the specified workspace folder. Ensures the devcontainer is operational and ready for development tasks.",
    schema: DevUpSchema,
    execute: async (args: ToolArgs) => {
      return devUp(DevUpSchema.parse(args));
    },
    label: "Devcontainer Up",
  },
  devcontainer_run_user_commands: {
    description:
      "Executes user-defined postCreateCommand and postStartCommand scripts within the devcontainer for the specified workspace. Use this to run setup or initialization tasks after container startup.",
    schema: DevRunSchema,
    execute: async (args: ToolArgs) => {
      return devRunUserCommands(DevRunSchema.parse(args));
    },
    label: "Devcontainer Run User Commands",
  },
  devcontainer_exec: {
    description:
      "Runs a custom shell command inside the devcontainer for the specified workspace. Useful for executing arbitrary commands or scripts within the devcontainer environment.",
    schema: DevExecSchema,
    execute: async (args: ToolArgs) => {
      return devExec(DevExecSchema.parse(args));
    },
    label: "Devcontainer Exec",
  },
  devcontainer_cleanup: {
    description:
      "Runs docker command to cleanup all devcontainer environments.",
    schema: DevCleanupSchema,
    execute: async (args: ToolArgs) => {
      return devCleanup(DevCleanupSchema.parse(args));
    },
    label: "Devcontainer Cleanup",
  },
  devcontainer_list: {
    description: "Runs docker command to list all devcontainer environments.",
    schema: DevListSchema,
    execute: async (args: ToolArgs) => {
      return devList(DevListSchema.parse(args));
    },
    label: "Devcontainer List",
  },
  devcontainer_workspace_folders: {
    description:
      "Runs find command to get all workspace folders with devcontainer config.",
    schema: DevWsFolderSchema,
    execute: async (args: ToolArgs) => {
      return devWsFolder(DevWsFolderSchema.parse(args));
    },
    label: "Devcontainer Workspace Folders",
  },
};

export const createServer = () => {
  const server = new Server(
    {
      name: "mcp-devcontainers",
      version: "1.0.1",
    },
    {
      capabilities: {
        tools: {},
      },
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
    const tools = Object.entries(ToolMap).map(([key, tool]) => ({
      name: key,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.schema) as ToolInput,
    }));

    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const Tool = ToolMap[name as ToolName];

    switch (name) {
      case "devcontainer_up":
      case "devcontainer_run_user_commands":
      case "devcontainer_exec":
      case "devcontainer_cleanup":
      case "devcontainer_list":
      case "devcontainer_workspace_folders":
      {
        try {
          const result = await Tool.execute(args);
          return {
            content: [
              { type: "text", text: `${Tool.label} result: ${result}` },
            ],
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          return {
            content: [
              { type: "text", text: `${Tool.label} failure: ${message}` },
            ],
            isError: true,
          };
        }
      }
      default:
        throw new Error(`Undefined tool: ${name}`);
    }
  });

  const cleanup = async () => {
    if (subsUpdateInterval) clearInterval(subsUpdateInterval);
  };

  return { server, cleanup };
};
