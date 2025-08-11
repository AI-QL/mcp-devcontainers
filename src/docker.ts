import { spawn, SpawnOptions, exec } from "child_process";
import fs from "fs";
import { z } from "zod";
import { promisify } from 'util';

const execAsync = promisify(exec);

const NULL_DEVICE = "/dev/null";

const COMMAND = "docker";

type CommandResult = Promise<string>;

const PS_PATTERN = "\"{psID: {{.ID}}, psName: {{.Names}}, workspaceFolder: {{.Label \"devcontainer.local_folder\"}}, container: {{.Label \"dev.containers.id\"}}}\""

export const DevCleanupSchema = z.object({});

export const DevListSchema = z.object({});

type DevCleanupArgs = z.infer<typeof DevCleanupSchema>;
type DevListArgs = z.infer<typeof DevListSchema>;

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
    const child = spawn(COMMAND, [...args], {
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
        const errorMessage = `Command failed: ${COMMAND} ${args.join(
          " "
        )} (${reason})\n-------\n${stderrData.join("\n\n")}`;
        reject(new Error(errorMessage));
      }
    });
  });
}

export async function devCleanup(options: DevCleanupArgs): CommandResult {
  void options;
  const stream = createOutputStream(NULL_DEVICE);

  let ids: string[];

  try {
    const { stdout } = await execAsync("docker ps -aq -f label=dev.containers.id")
    const raw = stdout.toString().trim();
    ids = raw ? raw.split("\n") : [];
  } catch (error) {
    return Promise.reject(`Cannot list all docker ps: ${(error as Error).message}`);
  }

  if (ids.length === 0) {
    return Promise.resolve(
      "No 'docker ps' results found; all devcontainers have already been cleaned up."
    );
  }

  return runCommand(["rm", "-f", ...ids], stream);
}

export async function devList(options: DevListArgs): CommandResult {
  void options;
  const stream = createOutputStream(NULL_DEVICE);

  return runCommand(
    ["ps", "-a", "--filter", "label=dev.containers.id", "--format", PS_PATTERN],
    stream
  );
}
