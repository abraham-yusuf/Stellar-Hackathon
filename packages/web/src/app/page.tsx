import Link from "next/link";
import { headers } from "next/headers";
import LiveFeed from "./components/LiveFeed";
import StatCard from "./components/StatCard";

interface QueryRecord {
  query: string;
  network: string;
  timestamp: string;
  txHash?: string;
}

interface StatsResponse {
  totalQueries: number;
  queriesLast24h: number;
  recentQueries: QueryRecord[];
}

const emptyStats: StatsResponse = {
  totalQueries: 0,
  queriesLast24h: 0,
  recentQueries: [],
};

const curlSnippet = `curl -i "http://localhost:3001/search/testnet?q=stellar%20ai&count=5" \\
  -H "Accept: application/json"`;

const nodeSnippet = `const res = await fetch(
  "http://localhost:3001/search/testnet?q=stellar%20ai&count=5"
);

if (!res.ok) {
  throw new Error(\`Search failed: \${res.status}\`);
}

const data = await res.json();
console.log(data.results);`;

async function getStats(): Promise<StatsResponse> {
  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    if (!host) {
      return emptyStats;
    }

    const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
    const res = await fetch(`${protocol}://${host}/api/stats`, { cache: "no-store" });
    if (!res.ok) {
      return emptyStats;
    }

    return (await res.json()) as StatsResponse;
  } catch {
    return emptyStats;
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(123,63,228,0.22),_transparent_28%),linear-gradient(180deg,_rgba(17,24,39,0.85),_rgba(2,6,23,1))]">
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-purple-200">
            Built for Stellar Hackathon 2026
          </span>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl">
            Web Search for AI Agents
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            StellarSearch turns search into a metered primitive: every query is discoverable, priced, and settled
            with Stellar-native x402 payments. No subscriptions. No quota negotiations. Just pay-per-query access for
            agents and apps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/try"
              className="inline-flex items-center rounded-xl bg-[#7B3FE4] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6b30d3]"
            >
              Try It →
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              View API Docs
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Queries" value={stats.totalQueries} />
          <StatCard label="Queries (24h)" value={stats.queriesLast24h} />
          <StatCard label="Price" value="0.01 USDC" />
          <StatCard label="Network" value="Stellar Testnet" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-glow">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">Live activity</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Recent paid search requests</h2>
              </div>
            </div>
            <LiveFeed />
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">Recent queries</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Latest stats snapshot</h2>
            <ul className="mt-6 space-y-3">
              {stats.recentQueries.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-4 py-5 text-sm text-slate-400">
                  No paid searches recorded yet.
                </li>
              ) : (
                stats.recentQueries.slice(0, 6).map((query, index) => (
                  <li
                    key={`${query.timestamp}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-sm text-slate-100">{query.query}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{query.network}</p>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(query.timestamp).toLocaleString()}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">How it works</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Discover",
                body: "Your app or agent calls the x402 discovery endpoint and learns pricing plus payment requirements.",
              },
              {
                step: "02",
                title: "Pay",
                body: "A 0.01 USDC payment is attached to the query request using Stellar-backed x402 authorization.",
              },
              {
                step: "03",
                title: "Query",
                body: "StellarSearch unlocks the web results and streams paid usage into the live dashboard in real time.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <span className="text-xs font-semibold tracking-[0.3em] text-purple-300">{item.step}</span>
                <h3 className="mt-3 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-300">Code example</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Integrate in minutes</h2>
            </div>
            <Link
              href="/docs"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              Full documentation
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-2">
            <input id="code-curl" type="radio" name="code-tabs" className="peer/curl sr-only" defaultChecked />
            <label
              htmlFor="code-curl"
              className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 transition peer-checked/curl:bg-slate-800 peer-checked/curl:text-white"
            >
              curl
            </label>
            <input id="code-node" type="radio" name="code-tabs" className="peer/node sr-only" />
            <label
              htmlFor="code-node"
              className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 transition peer-checked/node:bg-slate-800 peer-checked/node:text-white"
            >
              Node.js
            </label>

            <div className="basis-full pt-4 peer-checked/curl:block peer-checked/node:hidden">
              <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#020617] p-5 text-sm leading-7 text-emerald-300">
                <code>{curlSnippet}</code>
              </pre>
            </div>

            <div className="hidden basis-full pt-4 peer-checked/node:block">
              <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#020617] p-5 text-sm leading-7 text-emerald-300">
                <code>{nodeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-900 bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>StellarSearch is a pay-per-query dashboard for agents building on Stellar.</p>
          <div className="flex flex-wrap gap-4">
            <a href="https://github.com/abraham-yusuf/Stellar-Hackathon" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://developers.stellar.org/" target="_blank" rel="noreferrer">
              Stellar docs
            </a>
            <a href="https://dorahacks.io/" target="_blank" rel="noreferrer">
              DoraHacks
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
