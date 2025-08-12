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

## ✨ MCP Transport

### Option 1 - Start STDIO server

Launches the MCP server with **stdio transport**
```bash
npm start
```

### Option 2 - Start SSE server
Runs the MCP server with **Server-Sent Events transport** on `https://{your-domain}/sse`
```bash
npm start sse
```

### Option 3 - Start Streamable HTTP server
Starts the MCP server with **Streamable HTTP transport** on `https://{your-domain}/mcp`
```bash
npm start http
```

## 📚 Tools

Tools are built on the [devcontainers/cli](https://github.com/devcontainers/cli)

They enable you to generate and configure development containers directly from `devcontainer.json` configuration files:

### `devcontainer_up`

Initializes and starts a devcontainer environment in the specified workspace folder. Ensures the devcontainer is operational and ready for development tasks.

- #### Input Parameters
  | Name | Required | Type | Description |
  | -------- | -------- | -------- | -------- |
  | workspaceFolder   | ⚫ | string | Path to the workspace folder |
  | outputFilePath    | ⚪ | string | Path for output logs |

- #### Returns

  Text content with the devcontainer startup information


### `devcontainer_run_user_commands`

  Executes user-defined postCreateCommand and postStartCommand scripts within the devcontainer for the specified workspace. Use this to run setup or initialization tasks after container startup.

- #### Input Parameters
  | Name | Required | Type | Description |
  | -------- | -------- | -------- | -------- |
  | workspaceFolder   | ⚫ | string | Path to the workspace folder |
  | outputFilePath    | ⚪ | string | Path for output logs |

- #### Returns

  Text content with the command execution result


### `devcontainer_exec`

  Runs a custom shell command inside the devcontainer for the specified workspace. Useful for executing arbitrary commands or scripts within the devcontainer environment.

- #### Input Parameters
  | Name | Required | Type | Description |
  | -------- | -------- | -------- | -------- |
  | workspaceFolder   | ⚫ | string | Path to the workspace folder |
  | outputFilePath    | ⚪ | string | Path for output logs |
  | command           | ⚫ | string[ ] | Command to execute as string array |

- #### Returns

  Text content with the command execution result


### `devcontainer_cleanup`

  Runs docker command to cleanup all devcontainer environments.

- #### Input Parameters
  
  N/A

- #### Returns

  Text content with Docker process ID removed


### `devcontainer_list`

  Runs docker command to list all devcontainer environments.

- #### Input Parameters
  
  N/A

- #### Returns

  Text content with the current devcontainer Docker process status

### `devcontainer_workspace_folders`

  Runs find command to get all workspace folders with devcontainer config.

- #### Input Parameters
  | Name | Required | Type | Description |
  | -------- | -------- | -------- | -------- |
  | rootPath | ⚪ | string | A path used to search its subdirectories for all workspace folders containing a devcontainer configuration. |

- #### Returns

  Text content with all workspace folders under the specified root path.


## 🧑‍💻 Quick Experience / Trial

For developers who want to quickly try this project without a local Docker setup, we recommend using GitHub Codespaces:


[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/AI-QL/mcp-devcontainers?quickstart=1)

Then follow these steps to set up a trial environment:

- Wait for the environment to initialize in your browser

- Install dependencies: `npm install`

- Launch the service: `npm start http`

  > The codespace will automatically provide a forwarded port (e.g., https://ominous-halibut-7vvq7v56vgq6hr5p9-3001.app.github.dev/)

- Make the `forwarded port` publicly accessible (located on the right side of the VSCode `Terminal` tab)

- Connect using [mcp-inspector](https://github.com/modelcontextprotocol/inspector) via Streamable HTTP

  ```bash
  npx -y @modelcontextprotocol/inspector
  ```
  > For a streamable HTTP connection, remember to append `/mcp` to the URL

For MCP Clients that don't support remote URLs, use this alternative configuration:

```json
{
  "mcpServers": {
    "Devcontainer": {
      "command": "npx",
      "args": ["mcp-remote", "https://ominous-halibut-7vvq7v56vgq6hr5p9-3001.app.github.dev/mcp"]
    }
  }
}
```

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
