"use client";

import { useEffect, useMemo, useState } from "react";
import SearchDemo from "../components/SearchDemo";
import WalletPaymentPanel from "../components/WalletPaymentPanel";

type DiscoveryResponse = {
  resources?: string[];
};

type NetworksStatus = "loading" | "ready" | "error";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";

function routeLabel(path: string): string {
  if (path.endsWith("/testnet")) {
    return "Unlock Content (Testnet)";
  }
  if (path.endsWith("/mainnet")) {
    return "Unlock Content (Mainnet)";
  }
  return "Unlock Content";
}

export default function TryClient() {
  const [paidHash, setPaidHash] = useState<string | null>(null);
  const [resources, setResources] = useState<string[]>([]);
  const [networksStatus, setNetworksStatus] = useState<NetworksStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    fetch(`${SERVER_URL}/.well-known/x402`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed with status ${res.status}`);
        }
        return (await res.json()) as DiscoveryResponse;
      })
      .then((data) => {
        if (cancelled) return;
        const paidResources = (data.resources ?? [])
          .map((resource) => resource.replace(/^GET\s+/i, "").trim())
          .filter((path) => path.startsWith("/search/"));
        setResources(paidResources);
        setNetworksStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setResources([]);
        setNetworksStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const unlockLinks = useMemo(
    () =>
      resources.map((path) => ({
        path,
        label: routeLabel(path),
        href: `${SERVER_URL}${path}?q=stellar%20x402&count=5`,
      })),
    [resources],
  );

  return (
    <>
      <div className="mb-8 rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-5 sm:px-5">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Try the Paywall Demo</h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          Request a protected endpoint to trigger HTTP 402. After payment, retry to unlock results.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {networksStatus === "loading" ? (
            <p className="text-sm text-gray-400">Loading paid endpoints…</p>
          ) : null}
          {networksStatus === "error" ? (
            <p className="text-sm text-rose-200">Could not load paywall routes. Check server and refresh.</p>
          ) : null}
          {networksStatus === "ready" && unlockLinks.length === 0 ? (
            <p className="text-sm text-gray-400">No paid routes configured on the server.</p>
          ) : null}
          {unlockLinks.map((link) => (
            <a
              key={link.path}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-2xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
            >
              {link.label} →
            </a>
          ))}
        </div>
      </div>
      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-gray-200 sm:px-5">
        Wallet mode is enabled for Stellar Testnet USDC payments. Complete a payment to unlock search in this browser session.
        {paidHash ? (
          <span className="mt-2 block text-emerald-300">
            Last successful payment hash: <span className="font-mono">{paidHash}</span>
          </span>
        ) : null}
      </div>
      <div className="grid gap-8">
        <WalletPaymentPanel onPaid={setPaidHash} />
        <SearchDemo disabled={!paidHash} />
      </div>
    </>
  );
}
