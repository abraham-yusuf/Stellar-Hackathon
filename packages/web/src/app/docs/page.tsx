import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StellarSearch Docs",
};

const apiRows = [
  ["GET", "/search/testnet", "Paid testnet search endpoint"],
  ["GET", "/search/mainnet", "Paid mainnet search endpoint"],
  ["GET", "/stats", "JSON summary with totalQueries, queriesLast24h, recentQueries"],
  ["GET", "/stats/live", "SSE stream for recent paid queries"],
];

const responseExample = `{
  "query": "stellar x402",
  "count": 2,
  "results": [
    {
      "title": "x402 on Stellar",
      "url": "https://example.com/x402-stellar",
      "description": "Overview of x402 payments on Stellar.",
      "age": "2 hours ago"
    }
  ]
}`;

const mcpConfig = `{
  "mcpServers": {
    "stellarsearch": {
      "command": "pnpm",
      "args": ["start"],
      "cwd": "/absolute/path/to/packages/mcp",
      "env": {
        "STELLAR_SECRET_KEY": "S...",
        "STELLAR_NETWORK": "stellar:testnet",
        "SEARCH_API_URL": "http://localhost:3001"
      }
    }
  }
}`;

const nodeExample = `import { wrapFetchWithPayment, x402Client, x402HTTPClient } from "@x402/fetch";
import { ExactStellarScheme } from "./stellar/exact/client/scheme.js";
import { createEd25519Signer } from "./stellar/signer.js";

const signer = createEd25519Signer(process.env.STELLAR_SECRET_KEY!, "stellar:testnet");
const client = new x402Client().register("stellar:*", new ExactStellarScheme(signer));
const http = new x402HTTPClient(client);
const paidFetch = wrapFetchWithPayment(fetch, http);
const res = await paidFetch("http://localhost:3001/search/testnet?q=stellar%20x402&count=5");
console.log(await res.json());`;

const curlExample = `curl "http://localhost:3001/search/testnet?q=stellar%20x402&count=5"`;

export default function DocsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 md:py-20">
      <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-glow">
        <p className="text-sm uppercase tracking-[0.28em] text-purple-300">Documentation</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">API and MCP reference</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-300">
          StellarSearch exposes paid search endpoints over HTTP and a local MCP server that wraps them with x402 payment handling on Stellar.
        </p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.24em] text-gray-400">
            <tr>
              <th className="px-5 py-4">Method</th>
              <th className="px-5 py-4">Path</th>
              <th className="px-5 py-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-gray-200">
            {apiRows.map(([method, path, description]) => (
              <tr key={path}>
                <td className="px-5 py-4 text-purple-300">{method}</td>
                <td className="px-5 py-4 font-mono text-emerald-300">{path}</td>
                <td className="px-5 py-4 text-gray-300">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-gray-400">Query params</p>
          <ul className="mt-4 space-y-3 text-sm text-gray-300">
            <li><span className="font-mono text-white">q</span> — required search query string</li>
            <li><span className="font-mono text-white">count</span> — optional result count, 1-20</li>
            <li><span className="font-mono text-white">freshness</span> — optional upstream freshness filter</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-gray-400">Cost</p>
          <p className="mt-4 text-sm leading-7 text-gray-300">
            Each search query costs <span className="font-semibold text-white">0.01 USDC</span> on Stellar. Browser demos can bypass the paywall locally by setting <span className="font-mono text-white">PAYWALL_DISABLED=true</span> on the API server.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-gray-400">JSON response example</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-gray-200"><code>{responseExample}</code></pre>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-gray-400">MCP setup</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-gray-200"><code>{mcpConfig}</code></pre>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-gray-400">Node.js</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-gray-200"><code>{nodeExample}</code></pre>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-gray-400">curl</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-gray-200"><code>{curlExample}</code></pre>
        </div>
      </section>
    </div>
  );
}
