"""Real end-to-end smoke test: launches the actual MCP server as a
subprocess over stdio (exactly how Claude Code would) and calls real
tools through the real MCP protocol -- not just the underlying Python
functions."""
import asyncio
import os

from mcp import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client


async def main():
    params = StdioServerParameters(
        command="/Users/cyberteck/Desktop/decentralized.host/mcp-server/.venv/bin/python3",
        args=["-m", "dhost_mcp.server"],
        env={
            **os.environ,
            "DHOST_API_URL": os.environ.get("DHOST_API_URL", "http://localhost:8000"),
            "DHOST_DEPLOY_KEY": os.environ["DHOST_DEPLOY_KEY"],
        },
    )
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print("=== tools/list ===")
            for t in tools.tools:
                print(f"- {t.name}: {t.description[:70]}...")

            print("\n=== tools/call list_nodes ===")
            result = await session.call_tool("list_nodes", {})
            print(result.content[0].text[:400])

            print("\n=== tools/call get_deployment ===")
            result = await session.call_tool("get_deployment", {"name": "hello-world"})
            print(result.content[0].text[:400])


asyncio.run(main())
