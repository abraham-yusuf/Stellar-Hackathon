"use client";

import { FormEvent, useMemo, useState } from "react";
import PaymentBadge from "./PaymentBadge";

type SearchResult = {
  title: string;
  url: string;
  description: string;
  age?: string;
};

type SearchResponse = {
  query: string;
  count: number;
  results: SearchResult[];
  mock?: boolean;
  error?: string;
};

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";
const baseSteps = ["⏳ Sending request...", "🔐 402 received", "✅ Fetching results..."];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function SearchDemo() {
  const [query, setQuery] = useState("stellar x402" );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [statusSteps, setStatusSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState<string>("stellar x402");

  const stepList = useMemo(() => statusSteps, [statusSteps]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Enter a query to try the demo.");
      return;
    }

    setSubmittedQuery(trimmed);
    setLoading(true);
    setError(null);
    setResults([]);
    setStatusSteps([baseSteps[0]]);

    try {
      await sleep(300);
      setStatusSteps([baseSteps[0], baseSteps[1]]);
      await sleep(350);
      setStatusSteps(baseSteps);
      const res = await fetch(`${SERVER_URL}/search/testnet?q=${encodeURIComponent(trimmed)}&count=6`, {
        cache: "no-store",
      });
      const data = (await res.json()) as SearchResponse;

      if (!res.ok) {
        const message = res.status === 402
          ? "Payment required. Set PAYWALL_DISABLED=true on the server to use this demo without an on-chain payment flow."
          : data.error || `Search failed with status ${res.status}.`;
        throw new Error(message);
      }

      setResults(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-purple-500/20 bg-slate-950/80 p-4 shadow-glow sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-purple-300">Search demo</p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Try the testnet endpoint from the browser</h2>
          <p className="mt-3 max-w-2xl text-sm text-gray-400">
            This demo calls <span className="font-mono text-gray-200">/search/testnet</span> directly. For local demos, run the API with <span className="font-mono text-gray-200">PAYWALL_DISABLED=true</span>.
          </p>
        </div>
        {!loading && results.length > 0 ? <PaymentBadge /> : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 md:flex-row">
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search the web for AI-agent context"
          className="h-12 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-purple-500 px-5 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-900"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="mt-5 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Flow</p>
          <div className="mt-4 space-y-3">
            {baseSteps.map((step, index) => {
              const active = stepList.includes(step);
              return (
                <div key={step} className={`rounded-2xl border px-4 py-3 text-sm transition ${active ? "border-purple-400/40 bg-purple-500/10 text-white" : "border-white/10 bg-black/20 text-gray-500"}`}>
                  <span className="mr-2 text-xs text-gray-400">0{index + 1}</span>
                  {step}
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-2 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Results</p>
              <p className="mt-1 text-sm text-gray-500">Query: <span className="font-mono text-gray-200">{submittedQuery}</span></p>
            </div>
            {!loading && results.length > 0 ? <PaymentBadge /> : null}
          </div>

          {error ? <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

          <div className="mt-4 space-y-3">
            {!error && !loading && results.length === 0 ? (
              <p className="text-sm text-gray-400">Submit a query to preview the StellarSearch response.</p>
            ) : null}

            {results.map((result) => (
              <article key={result.url} className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 transition hover:border-purple-400/30 hover:bg-slate-950">
                <a href={result.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-purple-300 transition hover:text-purple-200">
                  {result.title}
                </a>
                <p className="mt-1 break-all text-sm text-emerald-300">{result.url}</p>
                <p className="mt-3 text-sm leading-6 text-gray-300">{result.description}</p>
                {result.age ? <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">{result.age}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
