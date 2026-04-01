# StellarSearch MCP Server

StellarSearch MCP is a local Model Context Protocol server that lets AI agents buy web search queries from the StellarSearch API. Each paid request uses x402 on Stellar and returns formatted search results over stdio for MCP-compatible clients.

## Prerequisites

- Node.js 20+
- pnpm
- A Stellar testnet account funded with the required USDC balance for x402 payments
- A running StellarSearch server or deployed API endpoint

## Setup

```bash
cp .env.example .env
```

Fill in `STELLAR_SECRET_KEY` and adjust the other settings if needed:

- `STELLAR_NETWORK` — `stellar:testnet` or `stellar:pubnet`
- `SEARCH_API_URL` — base URL of the StellarSearch API
- `X402_FACILITATOR_URL` — x402 facilitator base URL
- `X402_FACILITATOR_API_KEY` — optional facilitator API key

Install dependencies and start the MCP server:

```bash
pnpm install --ignore-workspace
pnpm dev
```

## Claude Code MCP configuration

Add an entry like this to your `mcp_settings.json`:

```json
{
  "mcpServers": {
    "stellarsearch": {
      "command": "pnpm",
      "args": ["start"],
      "cwd": "/absolute/path/to/packages/mcp",
      "env": {
        "STELLAR_SECRET_KEY": "S...",
        "STELLAR_NETWORK": "stellar:testnet",
        "SEARCH_API_URL": "http://localhost:3001",
        "X402_FACILITATOR_URL": "https://channels.openzeppelin.com/x402/testnet",
        "X402_FACILITATOR_API_KEY": ""
      }
    }
  }
}
```

## Available tools

- `web_search` — performs a paid StellarSearch query and returns formatted search results
- `search_info` — returns service metadata, configured network, API URL, and wallet address

## Cost

Each query costs `0.01 USDC` on Stellar. Make sure the configured wallet has sufficient balance before using the server.
