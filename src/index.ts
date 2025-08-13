#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const MCP_NAME = "mcp_clockify";
const VERSION = "1.0.19";
const CLOCKIFY_API_BASE = "https://api.clockify.me/api/v1";
const USER_AGENT = MCP_NAME + "/" + VERSION;

const server = new McpServer({
  name: MCP_NAME,
  version: VERSION,
  capabilities: {
    tools: {},
  },
});

async function makeAPIRequest<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: string | object
): Promise<T> {
  if (!process.env.CLOCKIFY_API_KEY) {
    throw new Error("Missing Clockify API key");
  }
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
    "x-api-key": process.env.CLOCKIFY_API_KEY,
    "Content-Type": "application/json",
  };
  try {
    const response = await fetch(CLOCKIFY_API_BASE + url, {
      headers,
      method,
      body: typeof body === "object" ? JSON.stringify(body) : body,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, response: ${errorText}`
      );
    }
    if (response.status === 204) return {} as T;
    return (await response.json()) as T;
  } catch (error: any) {
    throw new Error(`Error making Clockify API request: ${error.message}`);
  }
}

function sendResponse(
  type: "text" = "text",
  text: string | object = ""
): CallToolResult {
  return {
    content: [
      {
        type,
        text: typeof text === "string" ? text : JSON.stringify(text),
      },
    ],
  };
}

async function responseWrapper(fn: () => Promise<CallToolResult>) {
  try {
    return await fn();
  } catch (error: any) {
    return sendResponse("text", `Error: ${error.message}`);
  }
}

server.registerTool(
  "get-clockify-user",
  {
    description: "Retrieves the current Clockify user's profile information.",
    inputSchema: {},
  },
  () => {
    return responseWrapper(async () => {
      const response = await makeAPIRequest<any>("/user");
      return sendResponse("text", {
        id: response.id,
        email: response.email,
        name: response.name,
        activeWorkspace: response.activeWorkspace,
        defaultWorkspace: response.defaultWorkspace,
      });
    });
  }
);

server.registerTool(
  "list-clockify-workspaces",
  {
    description: "Retrieves a list of all workspaces from Clockify.",
    inputSchema: {},
  },
  () => {
    return responseWrapper(async () => {
      const response = await makeAPIRequest<any[]>("/workspaces");
      return sendResponse(
        "text",
        response.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
        }))
      );
    });
  }
);

server.registerTool(
  "list-clockify-projects",
  {
    description:
      "Retrieves a list of all projects in a specific workspace from Clockify.",
    inputSchema: {
      workspaceId: z
        .string()
        .describe(
          "This workspace ID can be obtained from the list-clockify-workspaces tool."
        ),
      name: z
        .string()
        .optional()
        .describe("Optional name search for projects."),
    },
  },
  (input) => {
    return responseWrapper(async () => {
      const response = await makeAPIRequest<any[]>(
        `/workspaces/${
          input.workspaceId
        }/projects?archived=false&page=1&page-size=5000&name=${
          input.name || ""
        }`
      );
      return sendResponse(
        "text",
        response.map((project) => ({
          id: project.id,
          name: project.name,
          workspaceId: project.workspaceId,
          billable: project.billable,
        }))
      );
    });
  }
);

server.registerTool(
  "list-clockify-tasks",
  {
    description:
      "Retrieves a list of all tasks in a specific project from Clockify.",
    inputSchema: {
      workspaceId: z
        .string()
        .describe(
          "This workspace ID can be obtained from the list-clockify-workspaces tool."
        ),
      projectId: z
        .string()
        .describe(
          "This project ID can be obtained from the list-clockify-projects tool."
        ),
    },
  },
  async (input) => {
    return responseWrapper(async () => {
      const response = await makeAPIRequest<any[]>(
        `/workspaces/${input.workspaceId}/projects/${input.projectId}/tasks`
      );
      return sendResponse(
        "text",
        response.map((task) => ({
          id: task.id,
          name: task.name,
          projectId: task.projectId,
        }))
      );
    });
  }
);

/**
 * List Time Entries Tool (list-clockify-time-entries)
 *
 * @param {string} workspaceId - The ID of the workspace to list time entries.
 * @param {string} userId - The ID of the user to list time entries for.
 * @param {string} start - Start date in yyyy-MM-ddThh:mm:ssZ format.
 * @param {string} end - End date in yyyy-MM-ddThh:mm:ssZ format.
 * @param {number} page - The page number to retrieve (1-based index).
 * @param {number} pageSize - The number of entries per page (default is 50).
 *
 * @returns {Promise<any>} - A promise that resolves to the list of time entries.
 */
server.registerTool(
  "list-clockify-time-entries",
  {
    description:
      "Retrieves a list of all time entries in a specific workspace in Clockify.",
    inputSchema: {
      workspaceId: z
        .string()
        .describe(
          "This workspace ID can be obtained from the list-clockify-workspaces tool."
        ),
      userId: z
        .string()
        .describe(
          "This user ID can be obtained from the get-clockify-user tool."
        ),
      start: z.string().describe("Start date in yyyy-MM-ddThh:mm:ssZ format."),
      end: z.string().describe("End date in yyyy-MM-ddThh:mm:ssZ format."),
      page: z
        .number()
        .min(1)
        .default(1)
        .describe("The page number to retrieve (1-based index)."),
      pageSize: z
        .number()
        .min(1)
        .default(100)
        .describe("The number of entries per page (default is 100)."),
    },
  },
  async (input) => {
    return responseWrapper(async () => {
      const response = await makeAPIRequest<any[]>(
        `/workspaces/${input.workspaceId}/user/${input.userId}/time-entries?start=${input.start}&end=${input.end}&page=${input.page}&page-size=${input.pageSize}`
      );
      return sendResponse("text", response);
    });
  }
);

/**
 * Create Time Entry Tool - API: /workspaces/{workspaceId}/time-entries
 *
 * @param {string} workspaceId - The ID of the workspace to create time entries in.
 * @param {boolean} billable - Billable time entries.
 * @param {string} description - Description of the time entry.
 * @param {string} start - Start date in Local timezone (yyyy-MM-ddThh:mm:ss format).
 * @param {string} end - End date in Local timezone (yyyy-MM-ddThh:mm:ss format).
 * @param {string} projectId - The ID of the project associated with the time entry.
 *
 * @returns {Promise<any>} - A promise that resolves to the created time entry data.
 */
server.registerTool(
  "create-clockify-time-entry",
  {
    description: "Creates a new time entry in Clockify.",
    inputSchema: {
      workspaceId: z
        .string()
        .describe(
          "This workspace ID can be obtained from the list-clockify-workspaces tool."
        ),
      billable: z
        .boolean()
        .optional()
        .default(true)
        .describe("Indicates if the time entry is billable."),
      description: z.string().describe("Description of the time entry."),
      start: z
        .string()
        .describe("Start date in Local timezone (yyyy-MM-ddThh:mm:ss format)."),
      end: z
        .string()
        .describe("End date in Local timezone (yyyy-MM-ddThh:mm:ss format)."),
      projectId: z
        .string()
        .describe(
          "This project ID can be obtained from the list-clockify-projects tool."
        ),
    },
  },
  async (input) => {
    const start = new Date(input.start);
    const end = new Date(input.end);
    return responseWrapper(async () => {
      const response = await makeAPIRequest<any>(
        `/workspaces/${input.workspaceId}/time-entries`,
        "POST",
        {
          billable: input.billable,
          description: input.description,
          start: start.toISOString(),
          end: end.toISOString(),
          projectId: input.projectId,
        }
      );
      return sendResponse("text", {
        id: response.id,
        description: response.description,
        start: response.timeInterval.start,
        end: response.timeInterval.end,
        projectId: response.projectId,
      });
    });
  }
);

/**
 * Update Time Entry Tool - API: /workspaces/{workspaceId}/time-entries/{timeEntryId}
 *
 * @param {string} workspaceId - The ID of the workspace to create time entries in.
 * @param {boolean} billable - Billable time entries.
 * @param {string} description - Description of the time entry.
 * @param {string} start - Start date in Local timezone (yyyy-MM-ddThh:mm:ss format).
 * @param {string} end - End date in Local timezone (yyyy-MM-ddThh:mm:ss format).
 * @param {string} projectId - The ID of the project associated with the time entry.
 *
 * @returns {Promise<any>} - A promise that resolves to the created time entry data.
 */
server.registerTool(
  "update-clockify-time-entry",
  {
    description:
      "Updates an existing time entry in Clockify if it is created by the user.",
    inputSchema: {
      timeEntryId: z
        .string()
        .describe(
          "This time entry ID can be obtained from the last created time entry."
        ),
      workspaceId: z
        .string()
        .describe(
          "This workspace ID can be obtained from the list-clockify-workspaces tool."
        ),
      billable: z
        .boolean()
        .optional()
        .default(true)
        .describe("Indicates if the time entry is billable."),
      description: z.string().describe("Description of the time entry."),
      start: z
        .string()
        .describe("Start date in Local timezone (yyyy-MM-ddThh:mm:ss format)."),
      end: z
        .string()
        .describe("End date in Local timezone (yyyy-MM-ddThh:mm:ss format)."),
      projectId: z
        .string()
        .describe(
          "This project ID can be obtained from the list-clockify-projects tool."
        ),
    },
  },
  async (input) => {
    const start = new Date(input.start);
    const end = new Date(input.end);
    return responseWrapper(async () => {
      const response = await makeAPIRequest<any>(
        `/workspaces/${input.workspaceId}/time-entries/${input.timeEntryId}`,
        "PUT",
        {
          billable: input.billable,
          description: input.description,
          start: start.toISOString(),
          end: end.toISOString(),
          projectId: input.projectId,
        }
      );
      return sendResponse("text", {
        id: response.id,
        description: response.description,
        start: response.timeInterval.start,
        end: response.timeInterval.end,
        projectId: response.projectId,
      });
    });
  }
);

server.registerTool(
  "delete-clockify-time-entry",
  {
    description: "Deletes a time entry in Clockify.",
    inputSchema: {
      timeEntryId: z
        .string()
        .describe(
          "This time entry ID can be obtained from the last created time entry."
        ),
      workspaceId: z
        .string()
        .describe(
          "This workspace ID can be obtained from the list-clockify-workspaces tool."
        ),
    },
  },
  async (input) => {
    return responseWrapper(async () => {
      await makeAPIRequest<null>(
        `/workspaces/${input.workspaceId}/time-entries/${input.timeEntryId}`,
        "DELETE"
      );
      return sendResponse("text", {
        message: "Time entry deleted successfully.",
      });
    });
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log(`${USER_AGENT} running on stdio`);
}

main().catch((error) => {
  console.error(`${USER_AGENT} error starting`, error);
  process.exit(1);
});
