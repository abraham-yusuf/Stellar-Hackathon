import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import LiveFeed from "./components/LiveFeed";
import StatCard from "./components/StatCard";

export const metadata: Metadata = {
  title: "StellarSearch — Pay-Per-Query Web Search on Stellar",
};

export const dynamic = "force-dynamic";

type StatsResponse = {
  totalQueries: number;
  queriesLast24h: number;
  recentQueries: Array<{ query: string; network: string; timestamp: string }>;
};

async function getStats(): Promise<StatsResponse> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");

  try {
    const res = await fetch(`${protocol}://${host}/api/stats`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Stats unavailable");
    }
    return (await res.json()) as StatsResponse;
  } catch {
    return { totalQueries: 0, queriesLast24h: 0, recentQueries: [] };
  }
}

const codeExamples = {
  curl: `curl "http://localhost:3001/search/testnet?q=stellar%20x402&count=5"`,
  node: `const response = await fetch("http://localhost:3001/search/testnet?q=stellar%20x402&count=5");\nconst data = await response.json();\nconsole.log(data.results);`,
};

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-20 px-6 py-12 md:py-20">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 px-8 py-14 shadow-glow md:px-12">
        <div className="absolute inset-0 bg-grid bg-[size:36px_36px] opacity-20" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/70 to-transparent" />
        <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-purple-200">
              Hackathon demo
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Web Search for AI Agents
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300 md:text-xl">
              Pay <span className="font-semibold text-white">0.01 USDC per query</span> via x402 on Stellar and return structured web search results for agents, dashboards, and tools.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/try" className="inline-flex items-center rounded-full bg-purple-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-400">
                Try It →
              </Link>
              <Link href="/docs" className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-purple-400/40 hover:bg-purple-500/10">
                API Docs
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.28em] text-gray-400">x402 flow</p>
            <div className="mt-5 space-y-3 text-sm text-gray-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">1. Agent requests a search result set.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">2. API returns HTTP 402 with payment requirements.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">3. Client pays via Stellar USDC and receives results.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-purple-300">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Request → 402 → pay → results</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Request", "Your agent calls the StellarSearch endpoint or MCP tool with a standard search query."],
              ["Pay", "x402 payment requirements specify a 0.01 USDC Stellar transaction for the query."],
              ["Receive", "The API settles the payment, runs the search, and returns structured JSON results."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">{title}</div>
                <p className="mt-4 text-sm leading-7 text-gray-300">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-purple-300">Stats</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Network snapshot</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Queries" value={stats.totalQueries} />
            <StatCard label="Price" value="0.01 USDC" />
            <StatCard label="Network" value="Stellar Testnet" />
          </div>
          <p className="mt-4 text-sm text-gray-400">{stats.queriesLast24h} queries recorded in the last 24 hours.</p>
        </div>
      </section>

      <LiveFeed />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-purple-300">Code example</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Drop into scripts or agent runtimes</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-gray-500">curl</p>
              <pre className="overflow-x-auto text-sm text-gray-200"><code>{codeExamples.curl}</code></pre>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-gray-500">Node.js</p>
              <pre className="overflow-x-auto text-sm text-gray-200"><code>{codeExamples.node}</code></pre>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-purple-300">Use cases</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Built for paid context retrieval</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-gray-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Agentic research with predictable query pricing and Stellar-native settlement.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">MCP integrations where each search call can be paid just in time.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Hackathon demos showing x402-based monetization for data APIs.</div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 px-8 py-6 text-sm text-gray-400 md:flex-row md:items-center md:justify-between">
        <p>StellarSearch turns web search into a composable paid primitive for agents.</p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="https://github.com/abraham-yusuf/Stellar-Hackathon" target="_blank" rel="noreferrer" className="transition hover:text-white">GitHub</a>
          <a href="https://developers.stellar.org/" target="_blank" rel="noreferrer" className="transition hover:text-white">Stellar docs</a>
          <a href="https://dorahacks.io/" target="_blank" rel="noreferrer" className="transition hover:text-white">DoraHacks</a>
        </div>
      </footer>
    </div>
  );
}
