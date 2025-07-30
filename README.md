# MCP Devcontainers

![](https://camo.githubusercontent.com/e36ffd91d8e6eaf39b1cf1d2ba210c6bb4022a772471bb077f28764e2a6da723/68747470733a2f2f62616467652e6d6370782e6465763f747970653d736572766572)
[![npm](https://img.shields.io/npm/v/mcp-devcontainers)](https://www.npmjs.com/package/mcp-devcontainers)
[![LICENSE](https://img.shields.io/github/license/AI-QL/mcp-devcontainers)](https://github.com/AI-QL/mcp-devcontainers/blob/main/LICENSE)

MCP server for devcontainer to generate and configure development containers directly from devcontainer.json configuration files.

## 📌 Pre-condition

This project is built with Node.js. For local development, you can either:
- Install `Node.js` on your machine, or  
- Use the provided [devcontainer](.devcontainer/devcontainer.json) virtual environment.

You may run the project without installing `Node.js` locally by using `npx`:
```bash
npx -y mcp-devcontainers
```

**Docker is required** in the execution environment:
- For **local MCP server**: Install Docker on your local machine  
- For **remote MCP server**: Install Docker on the remote server  

> 📦 Docker installation guide: https://docs.docker.com/get-started/get-docker/

## 🚀 Getting Started
- Build: `npm run build` - Compiles TypeScript to JavaScript
- Watch mode: `npm run watch` - Automatically rebuilds on file changes
- Prepare release: `npm run prepare` - Prepares the package for publishing
- Run ESLint: `npm run lint` - Executes ESLint for code validation
- Fix ESLint issues: `npm run lint:fix` - Automatically fixes ESLint errors

## MCP Transport

- Start server: `npm run start` - Launches the MCP server with **stdio transport**
- Start SSE server: `npm run start sse` - Runs the MCP server with **Server-Sent Events transport**
- Start Streamable HTTP server: `npm run start http` - Starts the MCP server with **Streamable HTTP transport**

## 📚 Tools

Tools are built on the [devcontainers/cli](https://github.com/devcontainers/cli)

They enable you to generate and configure development containers directly from `devcontainer.json` configuration files:

| Tool                             | workspaceFolder                       | outputFilePath                | Command                              | Description                                                                                                                                                                                      |
| -------------------------------- | ------------------------------------- | ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `devcontainer_up`                | Path to the workspace folder (string) | Path for output logs (string) | N/A                                  | Initializes and starts a devcontainer environment in the specified workspace folder.<br>Ensures the devcontainer is operational and ready for development tasks.                                    |
| `devcontainer_run_user_commands` | Path to the workspace folder (string) | Path for output logs (string) | N/A                                  | Executes user-defined `postCreateCommand` and `postStartCommand` scripts within the devcontainer for the specified workspace.<br>Use this to run setup or initialization tasks after container startup. |
| `devcontainer_exec`              | Path to the workspace folder (string) | Path for output logs (string) | Command to execute (array of string) | Runs a custom shell command inside the devcontainer for the specified workspace.<br>Useful for executing arbitrary commands or scripts within the devcontainer environment.                         |

## 🤝 Contributing

We welcome contributions of any kind to this project, including feature enhancements, UI improvements, documentation updates, test case completions, and syntax corrections. I believe that a real developer can write better code than AI, so if you have concerns about certain parts of the code implementation, feel free to share your suggestions or submit a pull request.

Please review our [Code of Conduct](CODE_OF_CONDUCT.md). It is in effect at all times. We expect it to be honored by everyone who contributes to this project.

For more information, please see [Contributing Guidelines](CONTRIBUTING.md)

## 🐞 Opening an Issue

Before creating an issue, check if you are using the latest version of the project. If you are not up-to-date, see if updating fixes your issue first.

### 🔒 Reporting Security Issues

Review our [Security Policy](SECURITY.md). Do not file a public issue for security vulnerabilities.

## ⭐ Credits

Written by [@AIQL.com](https://github.com/AI-QL).

## 📜 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
