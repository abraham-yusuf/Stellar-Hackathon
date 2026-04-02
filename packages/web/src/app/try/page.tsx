import type { Metadata } from "next";
import SearchDemo from "../components/SearchDemo";

export const metadata: Metadata = {
  title: "Try StellarSearch",
};

export default function TryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-20">
      <div className="mb-8 rounded-3xl border border-amber-400/20 bg-amber-500/10 px-4 py-4 text-sm leading-6 text-amber-100 sm:px-5">
        Demo mode expects the API server to run with <span className="font-mono">PAYWALL_DISABLED=true</span> so browser requests can reach <span className="font-mono">/search/testnet</span> without signing a payment.
      </div>
      <SearchDemo />
    </div>
  );
}
