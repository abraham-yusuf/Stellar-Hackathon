import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createSearchClient } from "./search.js";
import { STELLAR_PUBNET_CAIP2, STELLAR_TESTNET_CAIP2 } from "./stellar/constants.js";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);
loadEnv({ path: resolve(currentDir, "..", ".env") });

type StellarNetwork = typeof STELLAR_TESTNET_CAIP2 | typeof STELLAR_PUBNET_CAIP2;

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function getNetwork(): StellarNetwork {
  const value = (process.env.STELLAR_NETWORK ?? STELLAR_TESTNET_CAIP2).trim();
  if (value === STELLAR_TESTNET_CAIP2 || value === STELLAR_PUBNET_CAIP2) {
    return value;
  }
  throw new Error(
    `Unsupported STELLAR_NETWORK: ${value}. Use ${STELLAR_TESTNET_CAIP2} or ${STELLAR_PUBNET_CAIP2}.`,
  );
}

async function main() {
  const secretKey = getRequiredEnv("STELLAR_SECRET_KEY");
  const network = getNetwork();
  const searchApiUrl = process.env.SEARCH_API_URL?.trim() || "http://localhost:3001";
  const facilitatorUrl = getOptionalEnv("X402_FACILITATOR_URL");
  const facilitatorApiKey = getOptionalEnv("X402_FACILITATOR_API_KEY");
  const maxPaymentUsdc = getOptionalEnv("MAX_PAYMENT_USDC") ?? "0.10";

  const client = createSearchClient({
    secretKey,
    network,
    searchApiUrl,
    facilitatorUrl,
    facilitatorApiKey,
  });

  const server = new McpServer({
    name: "stellarsearch",
    version: "0.1.0",
  });

  server.tool(
    "web_search",
    "Search the web using StellarSearch. Automatically pays 0.01 USDC per query via x402 on Stellar. Returns structured search results with title, URL, description, and recency.",
    {
      query: z.string().describe("The search query"),
      count: z.number().int().min(1).max(20).default(10).describe("Number of results (1-20, default 10)"),
      freshness: z
        .enum(["d", "w", "m", "y"])
        .optional()
        .describe("Time filter: d=day, w=week, m=month, y=year"),
    },
    async ({ query, count, freshness }) => {
      try {
        const data = await client.search(query, { count, freshness });
        const formatted = data.results
          .map(
            (result, index) =>
              `${index + 1}. **${result.title}**\n   URL: ${result.url}\n   ${result.description}${result.age ? `\n   Age: ${result.age}` : ""}`,
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text: `Search results for "${query}" (${data.count} results${data.mock ? ", mock mode" : ""}):\n\n${formatted}`,
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Search failed: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "search_info",
    "Get information about the StellarSearch service: wallet address, network, pricing, and API endpoint.",
    {},
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              service: "StellarSearch",
              walletAddress: client.walletAddress,
              network,
              apiUrl: client.searchApiUrl,
              price: "0.01 USDC per query",
              asset: "USDC (Stellar)",
              maxPaymentUsdc,
              facilitator: {
                url: facilitatorUrl ?? null,
                apiKeyConfigured: Boolean(facilitatorApiKey),
              },
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("StellarSearch MCP server running over stdio");
  console.error(`Wallet: ${client.walletAddress}`);
  console.error(`Network: ${network}`);
  console.error(`API URL: ${client.searchApiUrl}`);
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
