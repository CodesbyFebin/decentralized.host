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

            print("=== tools/call ship ===")
            result = await session.call_tool("ship", {
                "project_dir": "/Users/cyberteck/Desktop/decentralized.host/examples/hello-world",
                "name": "mcp-test",
                "port": 8080,
                "message": "shipped via MCP protocol test",
            })
            print(result.content[0].text)

            print("\n=== tools/call delete_deployment (cleanup) ===")
            result = await session.call_tool("delete_deployment", {"name": "mcp-test"})
            print(result.content[0].text)


asyncio.run(main())
