import { spawn, SpawnOptions } from "child_process";
import fs from "fs";
import { z } from "zod";
import path from "path";
import { createRequire } from "module";

const NULL_DEVICE = "/dev/null";

type CommandResult = Promise<string>;

const WS_FOLDER_DESC = "Path to the workspace folder (string)";
const STDIO_FILE_PATH = `Path for output logs (string), default is ${NULL_DEVICE}`;
const COMMAND = "Command to execute (array of string)";

export const DevUpSchema = z.object({
  workspaceFolder: z.string().describe(WS_FOLDER_DESC),
  stdioFilePath: z.string().describe(STDIO_FILE_PATH).optional(),
});

export const DevRunSchema = z.object({
  workspaceFolder: z.string().describe(WS_FOLDER_DESC),
  stdioFilePath: z.string().describe(STDIO_FILE_PATH).optional(),
});

export const DevExecSchema = z.object({
  workspaceFolder: z.string().describe(WS_FOLDER_DESC),
  stdioFilePath: z.string().describe(STDIO_FILE_PATH).optional(),
  command: z.array(z.string()).min(1).describe(COMMAND),
});

type DevUpArgs = z.infer<typeof DevUpSchema>;
type DevRunArgs = z.infer<typeof DevRunSchema>;
type DevExecArgs = z.infer<typeof DevExecSchema>;

const require = createRequire(import.meta.url);

function devcontainerBinaryPath(): string {
  try {
    const pkgPath = require.resolve("@devcontainers/cli/package.json");
    const pkg = require(pkgPath);
    return path.join(path.dirname(pkgPath), pkg.bin.devcontainer);
  } catch (error) {
    throw new Error(
      "Failed to locate devcontainer CLI: " + (error as Error).message
    );
  }
}

function createOutputStream(
  stdioFilePath: string = NULL_DEVICE
): fs.WriteStream {
  try {
    return fs.createWriteStream(stdioFilePath, { flags: "w" });
  } catch (error) {
    throw new Error(
      `Failed to create output stream: ${(error as Error).message}`
    );
  }
}

async function runCommand(
  args: string[],
  stdoutStream: fs.WriteStream
): CommandResult {
  return new Promise((resolve, reject) => {
    const binaryPath = devcontainerBinaryPath();
    const child = spawn("node", [binaryPath, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    } as SpawnOptions);

    const stdoutData: string[] = [];
    const stderrData: string[] = [];

    child.on("error", (error) => {
      cleanup(error);
      reject(new Error(`Process spawn failed: ${error.message}`));
    });

    // Pipe stdout to the stream as before, but also collect it
    child.stdout?.on("data", (data) => {
      stdoutData.push(data.toString());
      stdoutStream.write(data);
    });

    // Collect stderr data instead of piping to process.stderr
    child.stderr?.on("data", (data) => {
      stderrData.push(data.toString().trim());
    });

    const cleanup = (error?: Error) => {
      child.stdout?.removeAllListeners();
      child.stderr?.removeAllListeners();
      if (!stdoutStream.writableEnded) {
        stdoutStream.end();
      }
      if (error) {
        stdoutStream.destroy();
      }
    };

    child.on("close", (code, signal) => {
      cleanup();
      if (code === 0) {
        resolve(
          `success with code ${code}\n-------\n${stdoutData.join("\n\n")}`
        );
      } else {
        const reason = signal
          ? `terminated by signal ${signal}`
          : `exited with code ${code}`;

        // Combine the error message with the collected stderr output
        const errorMessage = `Command failed: devcontainer ${args.join(
          " "
        )} (${reason})\n-------\n${stderrData.join("\n\n")}`;
        reject(new Error(errorMessage));
      }
    });
  });
}

export async function devUp(options: DevUpArgs): CommandResult {
  const stream = createOutputStream(options.stdioFilePath);
  return runCommand(
    ["up", "--workspace-folder", options.workspaceFolder],
    stream
  );
}

export async function devRunUserCommands(options: DevRunArgs): CommandResult {
  const stream = createOutputStream(options.stdioFilePath);
  return runCommand(
    ["run-user-commands", "--workspace-folder", options.workspaceFolder],
    stream
  );
}

export async function devExec(options: DevExecArgs): CommandResult {
  const stream = createOutputStream(options.stdioFilePath);
  return runCommand(
    ["exec", "--workspace-folder", options.workspaceFolder, ...options.command],
    stream
  );
}
