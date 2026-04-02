"use client";

import Link from "next/link";
import { useWallet } from "../lib/wallet";
import { shortenAddress } from "../lib/stellarUtils";

const links = [
  { href: "/", label: "Home" },
  { href: "/try", label: "Try It" },
  { href: "/docs", label: "Docs" },
];

export default function Nav() {
  const wallet = useWallet();
  const walletLabel = wallet.connected && wallet.address
    ? `${shortenAddress(wallet.address, 6)} • ${wallet.networkName ?? "unknown"}`
    : "Wallet disconnected";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white sm:text-sm sm:tracking-[0.24em]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-500/10 text-lg text-purple-300 shadow-glow sm:h-10 sm:w-10 sm:text-xl">⭐</span>
          <span>
            Stellar<span className="text-purple-400">Search</span>
          </span>
        </Link>
        <nav className="flex w-full items-center gap-2 overflow-x-auto pb-1 text-sm text-gray-300 sm:w-auto sm:pb-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full border border-transparent px-4 py-2 transition hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => (wallet.connected ? wallet.disconnect() : wallet.connect())}
            disabled={wallet.loading}
            className="whitespace-nowrap rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-purple-200 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {wallet.loading ? "Wallet..." : wallet.connected ? "Disconnect" : "Connect Wallet"}
          </button>
        </nav>
        <div className="w-full text-xs text-gray-400 sm:w-auto">{walletLabel}</div>
      </div>
    </header>
  );
}
