import type { Metadata } from "next";
import SearchDemo from "../components/SearchDemo";

export const metadata: Metadata = {
  title: "Try StellarSearch",
};

export default function TryPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      <div className="mb-8 rounded-3xl border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
        Demo mode expects the API server to run with <span className="font-mono">PAYWALL_DISABLED=true</span> so browser requests can reach <span className="font-mono">/search/testnet</span> without signing a payment.
      </div>
      <SearchDemo />
    </div>
  );
}
