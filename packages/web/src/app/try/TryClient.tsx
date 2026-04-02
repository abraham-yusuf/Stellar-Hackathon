"use client";

import { useState } from "react";
import SearchDemo from "../components/SearchDemo";
import WalletPaymentPanel from "../components/WalletPaymentPanel";

export default function TryClient() {
  const [paidHash, setPaidHash] = useState<string | null>(null);

  return (
    <>
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
