const apiRows = [
  {
    method: "GET",
    endpoint: "/search/testnet?q=<query>&count=<n>",
    auth: "x402 payment",
    description: "Runs a paid web search against the testnet route.",
  },
  {
    method: "GET",
    endpoint: "/stats",
    auth: "none",
    description: "Returns aggregate query volume plus recent paid searches.",
  },
  {
    method: "GET",
    endpoint: "/stats/live",
    auth: "none",
    description: "Streams live paid query events over server-sent events.",
  },
  {
    method: "GET",
    endpoint: "/.well-known/x402",
    auth: "none",
    description: "Publishes discovery metadata for x402-capable clients.",
  },
  {
    method: "GET",
    endpoint: "/health",
    auth: "none",
    description: "Returns service health for uptime probes and demos.",
  },
];

const responseExample = `{
  "query": "stellar defi protocols",
  "count": 3,
  "results": [
    {
      "title": "stellar defi protocols | Stellar Developer Guide",
      "url": "https://example.com/search/stellar%20defi%20protocols/stellar-guide",
      "description": "Mock result for \\"stellar defi protocols\\" showing normalized search output.",
      "age": "1 day ago"
    }
  ],
  "mock": true
}`;

const mcpSettings = `{
  "mcpServers": {
    "stellarsearch": {
      "command": "pnpm",
      "args": ["--filter", "@stellarsearch/mcp", "start"],
      "env": {
        "STELLARSEARCH_SERVER_URL": "http://localhost:3001"
      }
    }
  }
}`;

const nodeExample = `import { x402fetch } from "@x402/fetch";

const response = await x402fetch(
  "http://localhost:3001/search/testnet?q=stellar%20ai&count=5"
);

const data = await response.json();
console.log(data.results);`;

const curlExample = `curl -i "http://localhost:3001/search/testnet?q=stellar%20ai&count=5" \\
  -H "Accept: application/json"`;

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">Documentation</p>
        <h1 className="mt-3 text-4xl font-black text-white">StellarSearch API + MCP guide</h1>
        <p className="mt-4 text-base leading-8 text-slate-300">
          Use StellarSearch as a pay-per-query primitive for AI agents. Discovery and statistics are open; search
          routes enforce x402 payment unless the server is running in demo mode.
        </p>
      </div>

      <section className="mt-12 rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
        <h2 className="text-2xl font-bold text-white">API reference</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="py-3 pr-4 font-semibold">Method</th>
                <th className="py-3 pr-4 font-semibold">Endpoint</th>
                <th className="py-3 pr-4 font-semibold">Auth</th>
                <th className="py-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-200">
              {apiRows.map((row) => (
                <tr key={row.endpoint}>
                  <td className="py-3 pr-4 font-mono text-purple-300">{row.method}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-emerald-300">{row.endpoint}</td>
                  <td className="py-3 pr-4">{row.auth}</td>
                  <td className="py-3">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-2xl font-bold text-white">Search query parameters</h2>
          <ul className="mt-5 space-y-4 text-sm text-slate-300">
            <li>
              <span className="font-mono text-purple-300">q</span> — required search query string.
            </li>
            <li>
              <span className="font-mono text-purple-300">count</span> — optional result count, capped at 20.
            </li>
            <li>
              <span className="font-mono text-purple-300">freshness</span> — optional upstream freshness filter.
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-2xl font-bold text-white">JSON response shape</h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-[#020617] p-5 text-sm leading-7 text-emerald-300">
            <code>{responseExample}</code>
          </pre>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
        <h2 className="text-2xl font-bold text-white">MCP setup</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Add the StellarSearch MCP server to your local configuration so agents can discover and pay for queries
          programmatically.
        </p>
        <pre className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-[#020617] p-5 text-sm leading-7 text-emerald-300">
          <code>{mcpSettings}</code>
        </pre>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-2xl font-bold text-white">Node.js with @x402/fetch</h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-[#020617] p-5 text-sm leading-7 text-emerald-300">
            <code>{nodeExample}</code>
          </pre>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-2xl font-bold text-white">curl example</h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-[#020617] p-5 text-sm leading-7 text-emerald-300">
            <code>{curlExample}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
