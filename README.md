# Clockify MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with Clockify time tracking API. This server enables AI assistants to interact with Clockify to manage time entries, projects, tasks, and workspaces.

## Features

- 🕐 **Time Entry Management**: Create, update, delete, and list time entries
- 📁 **Project Management**: Browse and search projects across workspaces
- ✅ **Task Management**: Access and manage tasks within projects
- 👤 **User Profile**: Retrieve user information and workspace details
- 🏢 **Workspace Management**: List and navigate between workspaces

## Demonstration

![](https://i.imgur.com/h0DkSJ7.png)
![](https://i.imgur.com/KDLnxZk.png)
![](https://i.imgur.com/KHVmdHr.png)
![](https://i.imgur.com/AL7aL1N.png)
![](https://i.imgur.com/4UOx2lY.png)
![](https://i.imgur.com/21Ko3J2.png)

## Available Tools

### User Management

- `get-clockify-user` - Retrieve current user profile information

### Workspace Management

- `list-clockify-workspaces` - List all accessible workspaces

### Project Management

- `list-clockify-projects` - List projects in a workspace with optional name filtering

### Task Management

- `list-clockify-tasks` - List tasks within a specific project

### Time Entry Management

- `create-clockify-time-entry` - Create new time entries
- `update-clockify-time-entry` - Update existing time entries
- `delete-clockify-time-entry` - Delete time entries
- `list-clockify-time-entries` - List time entries with date filtering

## Prerequisites

1. **Clockify Account**: You need a Clockify account with API access
2. **API Key**: Generate your Clockify API key from your profile settings
3. **MCP-Compatible Client**: VS Code with GitHub Copilot, Claude Desktop, or other MCP clients

## Installation

### Option 1: Using NPX (Recommended)

Add the following configuration to your MCP client:

```json
{
  "servers": {
    "mcp_clockify": {
      "command": "npx",
      "args": ["-y", "mcp_clockify@latest"],
      "env": {
        "CLOCKIFY_API_KEY": "your-clockify-api-key-here"
      }
    }
  }
}
```

### Option 2: Local Development

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd clockify-mcp
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Build the project**:

   ```bash
   npm run build
   ```

4. **Configure your MCP client**:
   ```json
   {
     "servers": {
       "mcp_clockify": {
         "command": "node",
         "args": ["/path/to/clockify-mcp/build/index.js"],
         "env": {
           "CLOCKIFY_API_KEY": "your-clockify-api-key-here"
         }
       }
     }
   }
   ```

## Configuration

### Getting Your Clockify API Key

1. Log in to your Clockify account
2. Go to **Profile Settings** (click your avatar in the top-right corner)
3. Navigate to the **API** section
4. Generate or copy your existing API key

### VS Code Setup

1. Open VS Code
2. Run the command `MCP: Open User Configuration` (Ctrl/Cmd + Shift + P)
3. This opens or creates the `mcp.json` file in your user profile
4. Add the configuration with your API key:

```json
{
  "servers": {
    "mcp_clockify": {
      "command": "npx",
      "args": ["-y", "mcp_clockify@latest"],
      "env": {
        "CLOCKIFY_API_KEY": "your-clockify-api-key-here"
      }
    }
  }
}
```

5. Save the file and restart VS Code

### Claude Desktop Setup

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp_clockify": {
      "command": "npx",
      "args": ["-y", "mcp_clockify@latest"],
      "env": {
        "CLOCKIFY_API_KEY": "your-clockify-api-key-here"
      }
    }
  }
}
```

### Gemini CLI Setup

1. Open your Gemini CLI configuration file (e.g., `~/.gemini/settings.json`).
2. Add the following configuration:

```json
{
  "mcpServers": {
    "mcp_clockify": {
      "command": "npx",
      "args": ["-y", "mcp_clockify@latest"],
      "env": {
        "CLOCKIFY_API_KEY": "your-clockify-api-key-here"
      }
    }
  }
}
```

## Usage Examples

### Creating a Time Entry

```
I worked on the Research project for Acme Corp workspace from today 9 AM to 5 PM. Please create a time entry for this work session in Clockify.
```

### Listing Recent Time Entries

```
Show me my time entries for this week in Clockify.
```

### Managing Projects

```
List all projects in my main workspace and help me find the "Website Redesign" project.
```

### Daily Time Tracking

```
I need to log 3 hours of work on the Mobile App project from 2 PM to 5 PM today with the description "Bug fixes and testing".
```

## Development

### Scripts

- `npm run build` - Build the TypeScript project
- `npm start` - Start the server
- `npm run inspect` - Use MCP inspector for debugging

### Project Structure

```
├── src/
│   └── index.ts          # Main server implementation
├── build/
│   └── index.js          # Compiled JavaScript
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Troubleshooting

### Common Issues

1. **Invalid API Key Error**

   - Verify your API key is correct and has proper permissions
   - Check that the environment variable is properly set

2. **Network Connection Issues**

   - Ensure you have internet connectivity
   - Verify Clockify API is accessible from your network

3. **Server Not Starting**
   - Check that Node.js is installed (version 16 or higher)
   - Verify all dependencies are installed with `npm install`

### Debug Mode

Use the MCP inspector for debugging:

```bash
npm run inspect
```

This opens a web interface to test and debug the MCP server.

## API Reference

The server interacts with Clockify API v1. For detailed API documentation, visit [Clockify API Documentation](https://clockify.me/developers-api).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:

- Check the [troubleshooting section](#troubleshooting)
- Review [Clockify API documentation](https://clockify.me/developers-api)
- Open an issue on the repository

---

**Note**: This is an unofficial integration.
