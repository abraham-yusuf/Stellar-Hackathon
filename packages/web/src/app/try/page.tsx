import SearchDemo from "../components/SearchDemo";

export default function TryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold text-white">Try StellarSearch</h1>
      <p className="mb-2 text-gray-400">
        Live search demo. Requires the server running at{" "}
        <code className="text-green-400">http://localhost:3001</code> with{" "}
        <code className="text-green-400">PAYWALL_DISABLED=true</code>.
      </p>
      <p className="mb-8 rounded border border-yellow-800 px-3 py-2 text-xs text-yellow-600">
        Demo mode: payment flow is simulated. For real x402 payments, configure a Stellar wallet and run with payment
        enabled.
      </p>
      <SearchDemo />
    </div>
  );
}
