import os
from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters
# from google.adk.tools.mcp_tool import MCPToolset, StdioServerParameters

PATH_TO_YOUR_MCP_SERVER_SCRIPT = "/path/server.py"

root_agent = LlmAgent(
    model='gemini-2.0-flash',
    name='clockify_agent',
    instruction="You are a Clockify agent that can interact with the Clockify MCP server to manage time tracking tasks.",
    tools=[
        MCPToolset(
            connection_params=StdioServerParameters(
                command='python3', # Command to run your MCP server script
                args=[PATH_TO_YOUR_MCP_SERVER_SCRIPT], # Argument is the path to the script
            )
            # tool_filter=['load_web_page'] # Optional: ensure only specific tools are loaded
        )
    ],
)
