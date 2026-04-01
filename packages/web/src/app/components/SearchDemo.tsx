"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import PaymentBadge from "./PaymentBadge";

interface Result {
  title: string;
  url: string;
  description: string;
  age?: string;
}

export default function SearchDemo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mock, setMock] = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      setStep("⏳ Sending request to StellarSearch...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      setStep("🔐 Server requires 0.01 USDC payment (x402)");
      await new Promise((resolve) => setTimeout(resolve, 700));

      setStep("✅ Payment simulated (demo mode) — fetching results...");

      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";
      const res = await fetch(`${serverUrl}/search/testnet?q=${encodeURIComponent(query)}&count=5`);

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { results?: Result[]; mock?: boolean };
      setResults(data.results ?? []);
      setMock(data.mock ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
      setStep(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the web (e.g. 'stellar defi protocols')"
          className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {step ? (
        <div className="mb-4 rounded border border-gray-700 bg-gray-800 p-3 font-mono text-sm text-gray-300">
          {step}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-400">
          {error}
          {error.includes("payment") ? (
            <span className="mt-1 block text-xs text-red-500">
              Tip: Start the server with PAYWALL_DISABLED=true for demo mode
            </span>
          ) : null}
        </div>
      ) : null}

      {results.length > 0 ? (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-gray-400">{results.length} results</span>
            <PaymentBadge />
            {mock ? (
              <span className="rounded border border-yellow-700 px-2 py-0.5 text-xs text-yellow-500">mock data</span>
            ) : null}
          </div>
          <ul className="space-y-4">
            {results.map((r, i) => (
              <li key={`${r.url}-${i}`} className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener"
                  className="mb-1 block text-lg font-medium text-purple-400 hover:text-purple-300"
                >
                  {r.title}
                </a>
                <div className="mb-2 truncate text-xs text-green-600">{r.url}</div>
                <p className="text-sm text-gray-300">{r.description}</p>
                {r.age ? <span className="mt-1 block text-xs text-gray-500">{r.age}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
