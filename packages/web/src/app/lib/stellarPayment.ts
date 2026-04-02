import { Asset, BASE_FEE, Horizon, Networks, Operation, StrKey, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { getPublicStellarConfig } from "./stellarConfig";
import { parseUsdcAmount } from "./stellarUtils";

// Poll for up to ~12 seconds to surface a confirmed tx hash in the UI quickly.
const TX_CONFIRMATION_MAX_ATTEMPTS = 8;
const TX_CONFIRMATION_RETRY_DELAY_MS = 1500;

export type PaymentPreflight = {
  sourceAddress: string;
  sourceUsdcBalance: string;
  destinationAddress: string;
  amount: string;
};

export type PaymentResult = {
  hash: string;
  ledger?: number;
  amount: string;
};

function extractTransactionResultCode(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const maybeResponse = error as Error & {
    response?: { data?: { extras?: { result_codes?: { transaction?: string } } } };
  };

  return maybeResponse.response?.data?.extras?.result_codes?.transaction ?? null;
}

function toTransaction(xdr: string, networkPassphrase: string): Transaction {
  return TransactionBuilder.fromXDR(xdr, networkPassphrase) as Transaction;
}

export async function preflightUsdcPayment(sourceAddress: string, amountInput: string): Promise<PaymentPreflight> {
  const { config, error } = getPublicStellarConfig();
  if (!config) {
    throw new Error(error ?? "Invalid Stellar configuration.");
  }

  if (!StrKey.isValidEd25519PublicKey(sourceAddress)) {
    throw new Error("Connected wallet address is invalid.");
  }

  if (!StrKey.isValidEd25519PublicKey(config.payToAddress)) {
    throw new Error("Recipient address is invalid.");
  }

  const amount = parseUsdcAmount(amountInput);
  const horizon = new Horizon.Server(config.horizonUrl);

  const [sourceAccount, destinationAccount] = await Promise.all([
    horizon.loadAccount(sourceAddress),
    horizon.loadAccount(config.payToAddress),
  ]);

  if (!sourceAccount.accountId()) {
    throw new Error("Wallet account is not funded on Stellar testnet.");
  }

  if (!destinationAccount.accountId()) {
    throw new Error("Recipient account is not funded on Stellar testnet.");
  }

  const trustline = sourceAccount.balances.find(
    (balance) =>
      balance.asset_type !== "native" &&
      "asset_code" in balance &&
      "asset_issuer" in balance &&
      balance.asset_code === config.usdcAssetCode &&
      balance.asset_issuer === config.usdcIssuer,
  );

  if (!trustline) {
    throw new Error("Your wallet has no trustline for configured USDC testnet asset.");
  }

  return {
    sourceAddress,
    sourceUsdcBalance: trustline.balance,
    destinationAddress: config.payToAddress,
    amount,
  };
}

async function buildAndSignTransaction(
  sourceAddress: string,
  amount: string,
  signXdr: (xdr: string) => Promise<string>,
): Promise<Transaction> {
  const { config, error } = getPublicStellarConfig();
  if (!config) {
    throw new Error(error ?? "Invalid Stellar configuration.");
  }

  const horizon = new Horizon.Server(config.horizonUrl);
  const account = await horizon.loadAccount(sourceAddress);
  const asset = new Asset(config.usdcAssetCode, config.usdcIssuer);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: config.payToAddress,
        asset,
        amount,
      }),
    )
    .setTimeout(180)
    .build();

  const signedXdr = await signXdr(tx.toXDR());
  return toTransaction(signedXdr, config.networkPassphrase);
}

async function waitForTransactionConfirmation(horizon: Horizon.Server, hash: string): Promise<{ hash: string; ledger?: number }> {
  for (let attempt = 0; attempt < TX_CONFIRMATION_MAX_ATTEMPTS; attempt += 1) {
    try {
      const tx = await horizon.transactions().transaction(hash).call();
      // `ledger_attr` comes from Horizon's transaction response shape.
      return { hash, ledger: tx.ledger_attr };
    } catch {
      await new Promise((resolve) => setTimeout(resolve, TX_CONFIRMATION_RETRY_DELAY_MS));
    }
  }

  return { hash };
}

export async function sendUsdcPayment(
  sourceAddress: string,
  amountInput: string,
  signXdr: (xdr: string) => Promise<string>,
): Promise<PaymentResult> {
  const { config, error } = getPublicStellarConfig();
  if (!config) {
    throw new Error(error ?? "Invalid Stellar configuration.");
  }

  const { amount } = await preflightUsdcPayment(sourceAddress, amountInput);
  const horizon = new Horizon.Server(config.horizonUrl);

  let signedTx = await buildAndSignTransaction(sourceAddress, amount, signXdr);

  try {
    const submitResult = await horizon.submitTransaction(signedTx);
    const confirmed = await waitForTransactionConfirmation(horizon, submitResult.hash);
    return { ...confirmed, amount };
  } catch (error) {
    const code = extractTransactionResultCode(error);
    if (code !== "tx_bad_seq") {
      throw error;
    }

    signedTx = await buildAndSignTransaction(sourceAddress, amount, signXdr);
    const retryResult = await horizon.submitTransaction(signedTx);
    const confirmed = await waitForTransactionConfirmation(horizon, retryResult.hash);
    return { ...confirmed, amount };
  }
}
