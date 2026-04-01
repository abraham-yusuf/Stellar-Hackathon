# StellarSearch MCP server

StellarSearch MCP gives AI agents a `web_search` tool that automatically pays for each query with x402 on Stellar using USDC. No API key is required for search access. The configured Stellar wallet pays 0.01 USDC per search automatically.

## Prerequisites

- Node.js 20+
- A Stellar testnet account with testnet USDC
- Testnet USDC faucet and tooling: https://stellar-laboratory.vercel.app

## Setup

```bash
cp .env.example .env
# Edit .env with your STELLAR_SECRET_KEY and SEARCH_API_URL
pnpm install
```

## Claude Code config

Use in `.claude/mcp_settings.json` or Claude Desktop settings:

```json
{
  "mcpServers": {
    "stellarsearch": {
      "command": "npx",
      "args": ["tsx", "/path/to/packages/mcp/src/index.ts"],
      "env": {
        "STELLAR_SECRET_KEY": "S...",
        "STELLAR_NETWORK": "stellar:testnet",
        "SEARCH_API_URL": "http://localhost:3001"
      }
    }
  }
}
```

## Available tools

- `web_search`
- `search_info`

## Example usage in Claude

`Search the web for the latest Stellar DeFi protocols`

## Costs

Each `web_search` call costs 0.01 USDC from the configured wallet.
