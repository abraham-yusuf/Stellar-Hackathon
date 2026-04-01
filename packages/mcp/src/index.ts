import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createSearchClient } from "./search.js";

async function main() {
  const secretKey = process.env.STELLAR_SECRET_KEY?.trim();
  if (!secretKey) throw new Error("Missing STELLAR_SECRET_KEY");

  const network = process.env.STELLAR_NETWORK ?? "stellar:testnet";
  const searchApiUrl = process.env.SEARCH_API_URL ?? "http://localhost:3001";
  const facilitatorUrl = process.env.X402_FACILITATOR_URL;

  const client = createSearchClient({ secretKey, network, searchApiUrl, facilitatorUrl });

  const server = new McpServer({ name: "stellarsearch", version: "0.1.0" });

  server.tool(
    "web_search",
    "Search the web via StellarSearch. Pays 0.01 USDC per query via x402 on Stellar.",
    {
      query: z.string().describe("Search query"),
      count: z.number().int().min(1).max(20).default(10).describe("Number of results (1-20)"),
    },
    async ({ query, count }) => {
      try {
        const data = await client.search(query, count);
        const text = data.results
          .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.description}${r.age ? `\n   (${r.age})` : ""}`)
          .join("\n\n");
        return {
          content: [{ type: "text", text: `Results for "${query}" (${data.count}${data.mock ? ", mock" : ""}):\n\n${text}` }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Search failed: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    },
  );

  server.tool("search_info", "Get StellarSearch service info.", {}, async () => ({
    content: [{ type: "text", text: JSON.stringify({ service: "StellarSearch", wallet: client.walletAddress, network, api: searchApiUrl, price: "0.01 USDC/query" }, null, 2) }],
  }));

  await server.connect(new StdioServerTransport());
  console.error(`StellarSearch MCP ready | wallet: ${client.walletAddress} | network: ${network}`);
}

main().catch(err => { console.error(err); process.exit(1); });
