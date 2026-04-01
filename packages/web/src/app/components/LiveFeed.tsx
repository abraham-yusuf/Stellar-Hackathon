"use client";

import { useEffect, useState } from "react";

interface QueryRecord {
  query: string;
  network: string;
  timestamp: string;
  txHash?: string;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export default function LiveFeed() {
  const [queries, setQueries] = useState<QueryRecord[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";
    const es = new EventSource(`${serverUrl}/stats/live`);

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (e) => {
      try {
        const record = JSON.parse(e.data) as Partial<QueryRecord>;
        if (!record.query || !record.network || !record.timestamp) {
          return;
        }

        setQueries((prev) => [record as QueryRecord, ...prev].slice(0, 10));
      } catch {
        return;
      }
    };

    return () => es.close();
  }, []);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-white">Live Query Feed</h3>
        <span className={`flex items-center gap-1 text-xs ${connected ? "text-green-400" : "text-gray-500"}`}>
          <span
            className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-gray-500"}`}
          />
          {connected ? "LIVE" : "Connecting..."}
        </span>
      </div>

      {queries.length === 0 ? (
        <p className="text-sm text-gray-500">No queries yet — run a search to see live data</p>
      ) : (
        <ul className="space-y-2">
          {queries.map((q, i) => (
            <li
              key={`${q.timestamp}-${i}`}
              className="flex items-center gap-3 border-b border-gray-800 py-1 text-sm last:border-0"
            >
              <span
                className={`rounded px-2 py-0.5 font-mono text-xs ${
                  q.network === "mainnet" ? "bg-green-900 text-green-300" : "bg-blue-900 text-blue-300"
                }`}
              >
                {q.network}
              </span>
              <span className="flex-1 truncate font-mono text-gray-200">{q.query}</span>
              <span className="shrink-0 text-xs text-gray-500">{timeAgo(q.timestamp)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
