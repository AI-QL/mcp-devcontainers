import { spawn, SpawnOptions } from 'child_process';
import fs from 'fs';
import path from "path";
import { createRequire } from "module";

export const NULL_DEVICE = '/dev/null';
const require = createRequire(import.meta.url);

function devcontainerBinaryPath(): string {
  try {
    const pkgPath = require.resolve('@devcontainers/cli/package.json');
    const pkg = require(pkgPath);
    return path.join(path.dirname(pkgPath), pkg.bin.devcontainer);
  } catch (error) {
    throw new Error('Failed to locate devcontainer CLI: ' + (error as Error).message);
  }
}

interface DevcontainerOptions {
  stdioFilePath?: string;
}

interface DevContainerUpOptions extends DevcontainerOptions {
  workspaceFolder: string;
}

interface DevContainerRunUserCommandsOptions extends DevcontainerOptions {
  workspaceFolder: string;
}

interface DevContainerExecOptions extends DevcontainerOptions {
  workspaceFolder: string;
  command: string[];
}

function createOutputStream(stdioFilePath: string = NULL_DEVICE): fs.WriteStream {
  try {
    return fs.createWriteStream(stdioFilePath, { flags: 'w' })
  } catch (error) {
    throw new Error(`Failed to create output stream: ${(error as Error).message}`);
  }
}

async function runCommand(args: string[], stdoutStream: fs.WriteStream): Promise<number> {
  return new Promise((resolve, reject) => {
    const binaryPath = devcontainerBinaryPath();
    const child = spawn('node', [binaryPath, ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
    } as SpawnOptions);

    child.on('error', (error) => {
      cleanup(error);
      reject(new Error(`Process spawn failed: ${error.message}`));
    });


    child.stdout?.pipe(stdoutStream);
    child.stderr?.pipe(process.stderr);

    const cleanup = (error?: Error) => {
      child.stdout?.unpipe();
      if (!stdoutStream.writableEnded) {
        stdoutStream.end();
      }
      if (error) {
        stdoutStream.destroy();
      }
    };

    child.on('close', (code, signal) => {
      cleanup();
      if (code === 0) {
        resolve(code);
      } else {
        const reason = signal
          ? `terminated by signal ${signal}`
          : `exited with code ${code}`;
        reject(new Error(`Command failed: ${args.join(' ')} (${reason})`));
      }
    });
  });
}

export async function devUp(options: DevContainerUpOptions): Promise<number> {
  const stream = createOutputStream(options.stdioFilePath);
  return runCommand(['up', '--workspace-folder', options.workspaceFolder], stream);
}

export async function devRunUserCommands(options: DevContainerRunUserCommandsOptions): Promise<number> {
  const stream = createOutputStream(options.stdioFilePath);
  return runCommand(['run-user-commands', '--workspace-folder', options.workspaceFolder], stream);
}

export async function devExec(options: DevContainerExecOptions): Promise<number> {
  const stream = createOutputStream(options.stdioFilePath);
  return runCommand([
    'exec',
    '--workspace-folder',
    options.workspaceFolder,
    ...options.command
  ], stream);
}