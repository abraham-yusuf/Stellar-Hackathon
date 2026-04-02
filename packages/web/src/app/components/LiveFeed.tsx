"use client";

import { useEffect, useMemo, useState } from "react";

type LiveQuery = {
  query: string;
  network: string;
  timestamp: string;
  txHash?: string;
};

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";

function formatTimeAgo(timestamp: string, now: number) {
  const seconds = Math.max(0, Math.floor((now - new Date(timestamp).getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function LiveFeed() {
  const [connected, setConnected] = useState(false);
  const [entries, setEntries] = useState<LiveQuery[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const url = `${SERVER_URL}/stats/live`;
    const source = new EventSource(url);

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = event => {
      try {
        const payload = JSON.parse(event.data) as LiveQuery | { type: string };
        if ("type" in payload) {
          return;
        }
        setEntries(current => [payload, ...current].slice(0, 10));
      } catch {
        setConnected(false);
      }
    };

    return () => {
      source.close();
      setConnected(false);
    };
  }, []);

  const rows = useMemo(() => entries, [entries]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-glow sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-purple-300">Live feed</p>
          <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Fresh paid queries streaming from the API</h3>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
          <span className={`h-2.5 w-2.5 rounded-full ${connected ? "animate-pulse bg-emerald-400" : "bg-gray-500"}`} />
          LIVE
        </div>
      </div>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-gray-400">
            No queries yet — run the server to see live data
          </div>
        ) : (
          rows.map((entry) => {
            const isMainnet = entry.network === "mainnet" || entry.network === "stellar:pubnet";
            return (
              <div key={`${entry.timestamp}-${entry.query}`} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${isMainnet ? "bg-emerald-500/15 text-emerald-300" : "bg-sky-500/15 text-sky-300"}`}>
                    {isMainnet ? "Mainnet" : "Testnet"}
                  </span>
                  <div>
                    <p className="font-mono text-sm text-white">{entry.query}</p>
                    {entry.txHash ? <p className="mt-1 text-xs text-gray-500">tx {entry.txHash.slice(0, 18)}…</p> : null}
                  </div>
                </div>
                <p className="text-sm text-gray-400">{formatTimeAgo(entry.timestamp, now)}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
