export default function PaymentBadge({ txHash }: { txHash?: string }) {
  const href = txHash ? `https://stellar.expert/explorer/testnet/tx/${txHash}` : undefined;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-700 bg-green-900/50 px-2 py-1 text-xs text-green-400">
      ✓ 0.01 USDC paid on Stellar
      {href ? (
        <a href={href} target="_blank" rel="noopener" className="ml-1 underline">
          tx ↗
        </a>
      ) : null}
    </span>
  );
}
