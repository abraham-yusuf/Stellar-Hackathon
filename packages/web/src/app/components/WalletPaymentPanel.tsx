"use client";

import { FormEvent, useMemo, useState } from "react";
import { getPublicStellarConfig } from "../lib/stellarConfig";
import { preflightUsdcPayment, sendUsdcPayment } from "../lib/stellarPayment";
import { parseUsdcAmount, shortenAddress } from "../lib/stellarUtils";
import { useWallet } from "../lib/wallet";

type TxStage = "idle" | "building" | "signing" | "submitting" | "confirming" | "success" | "error";

const stageLabels: Record<TxStage, string> = {
  idle: "Idle",
  building: "Building transaction",
  signing: "Awaiting wallet signature",
  submitting: "Submitting transaction",
  confirming: "Confirming on testnet",
  success: "Payment confirmed",
  error: "Payment failed",
};

export default function WalletPaymentPanel({ onPaid }: { onPaid: (hash: string) => void }) {
  const wallet = useWallet();
  const { config, error: configError } = getPublicStellarConfig();

  const [amountInput, setAmountInput] = useState(config?.defaultAmount ?? "0.01");
  const [stage, setStage] = useState<TxStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txLedger, setTxLedger] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const networkMismatch = !!wallet.networkPassphrase && !!config && wallet.networkPassphrase !== config.networkPassphrase;

  const txUrl = useMemo(() => {
    if (!txHash || !config) return null;
    return `${config.explorerBaseUrl}/${txHash}`;
  }, [config, txHash]);

  async function handlePreflight(): Promise<void> {
    if (!wallet.address) {
      throw new Error("Connect wallet before preflight checks.");
    }

    setStage("building");
    const preflight = await preflightUsdcPayment(wallet.address, amountInput);
    setBalance(preflight.sourceUsdcBalance);
  }

  async function handlePay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setTxHash(null);
    setTxLedger(null);

    if (configError) {
      setStage("error");
      setError(configError);
      return;
    }

    if (!config) {
      setStage("error");
      setError("Missing public Stellar config.");
      return;
    }

    if (!wallet.connected || !wallet.address) {
      setStage("error");
      setError("Connect wallet first.");
      return;
    }

    if (networkMismatch) {
      setStage("error");
      setError("Wallet network mismatch. Switch wallet to Stellar testnet.");
      return;
    }

    try {
      parseUsdcAmount(amountInput);
      await handlePreflight();
      setStage("signing");

      const result = await sendUsdcPayment(wallet.address, amountInput, async (xdr) => {
        setStage("signing");
        const signed = await wallet.signXdr(xdr);
        setStage("submitting");
        return signed;
      });

      setStage("confirming");
      setTxHash(result.hash);
      setTxLedger(result.ledger ?? null);
      onPaid(result.hash);
      setStage("success");
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Payment failed");
    }
  }

  const disabled = !wallet.connected || wallet.loading || !!configError;

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-glow sm:p-6">
      <p className="text-sm uppercase tracking-[0.28em] text-purple-300">Wallet payment</p>
      <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Send real USDC on Stellar Testnet</h2>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
        <p>Flow: connect wallet → verify trustline → sign tx in wallet → submit → confirm.</p>
        {config ? (
          <dl className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-gray-400">
            <dt>Recipient:</dt>
            <dd className="font-mono text-gray-200">{shortenAddress(config.payToAddress, 8)}</dd>
            <dt>Asset:</dt>
            <dd className="font-mono text-gray-200">{config.usdcAssetCode}</dd>
          </dl>
        ) : null}
      </div>

      <form onSubmit={handlePay} className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-gray-400">Amount (USDC)</label>
          <input
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            placeholder="0.01"
            className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-400"
          />
          {balance ? <p className="mt-2 text-xs text-gray-400">Detected trustline balance: <span className="font-mono text-gray-200">{balance}</span></p> : null}
        </div>

        <div className="flex flex-col justify-end gap-3">
          <button
            type="button"
            onClick={() => (wallet.connected ? wallet.disconnect() : wallet.connect())}
            disabled={wallet.loading}
            className="h-12 rounded-2xl border border-purple-500/30 bg-purple-500/10 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {wallet.loading ? "Wallet..." : wallet.connected ? "Disconnect wallet" : "Connect wallet"}
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="h-12 rounded-2xl bg-emerald-500 px-5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Pay now
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
        <p>
          Stage: <span className="font-semibold text-white">{stageLabels[stage]}</span>
        </p>
        {wallet.address ? (
          <p>
            Wallet: <span className="font-mono text-gray-200">{shortenAddress(wallet.address, 8)}</span>
          </p>
        ) : null}
        {networkMismatch ? <p className="text-amber-200">Wallet is not on testnet. Switch network before paying.</p> : null}
        {wallet.error ? <p className="text-rose-200">Wallet: {wallet.error}</p> : null}
        {configError ? <p className="text-rose-200">Config: {configError}</p> : null}
        {error ? <p className="text-rose-200">Error: {error}</p> : null}
        {txHash ? (
          <p>
            Hash: <span className="font-mono text-emerald-300">{txHash}</span>
            {txUrl ? (
              <a className="ml-2 text-purple-300 underline" href={txUrl} target="_blank" rel="noreferrer">
                explorer
              </a>
            ) : null}
          </p>
        ) : null}
        {txLedger ? <p>Ledger: <span className="font-mono text-gray-200">{txLedger}</span></p> : null}
      </div>
    </section>
  );
}
