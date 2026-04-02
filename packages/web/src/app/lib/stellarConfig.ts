import { Networks, StrKey } from "@stellar/stellar-sdk";

export type PublicStellarConfig = {
  serverUrl: string;
  horizonUrl: string;
  networkPassphrase: string;
  networkName: string;
  usdcAssetCode: string;
  usdcIssuer: string;
  payToAddress: string;
  explorerBaseUrl: string;
  defaultAmount: string;
};

const DEFAULTS = {
  serverUrl: "http://localhost:3001",
  horizonUrl: "https://horizon-testnet.stellar.org",
  networkName: "testnet",
  usdcAssetCode: "USDC",
  explorerBaseUrl: "https://stellar.expert/explorer/testnet/tx",
  defaultAmount: "0.01",
};

const SUPPORTED_NETWORK = "testnet";

function readEnvWithFallback(name: string, fallback?: string): string {
  const value = process.env[name]?.trim();
  if (value) {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  return "";
}

export function getPublicStellarConfig(): { config?: PublicStellarConfig; error?: string } {
  const serverUrl = readEnvWithFallback("NEXT_PUBLIC_SERVER_URL", DEFAULTS.serverUrl);
  const horizonUrl = readEnvWithFallback("NEXT_PUBLIC_STELLAR_TESTNET_HORIZON_URL", DEFAULTS.horizonUrl);
  const networkName = readEnvWithFallback("NEXT_PUBLIC_STELLAR_NETWORK", DEFAULTS.networkName).toLowerCase();
  const usdcAssetCode = readEnvWithFallback("NEXT_PUBLIC_STELLAR_USDC_ASSET_CODE", DEFAULTS.usdcAssetCode);
  const usdcIssuer = readEnvWithFallback("NEXT_PUBLIC_STELLAR_USDC_ISSUER");
  const payToAddress = readEnvWithFallback("NEXT_PUBLIC_STELLAR_PAY_TO_ADDRESS");
  const explorerBaseUrl = readEnvWithFallback("NEXT_PUBLIC_STELLAR_EXPLORER_TX_BASE_URL", DEFAULTS.explorerBaseUrl);
  const defaultAmount = readEnvWithFallback("NEXT_PUBLIC_STELLAR_PAYMENT_DEFAULT_AMOUNT", DEFAULTS.defaultAmount);

  if (networkName !== SUPPORTED_NETWORK) {
    return { error: "Only Stellar testnet is supported by this wallet payment flow." };
  }

  if (!usdcIssuer) {
    return { error: "Missing NEXT_PUBLIC_STELLAR_USDC_ISSUER." };
  }

  if (!StrKey.isValidEd25519PublicKey(usdcIssuer)) {
    return { error: "NEXT_PUBLIC_STELLAR_USDC_ISSUER must be a valid Stellar G-address." };
  }

  if (!payToAddress) {
    return { error: "Missing NEXT_PUBLIC_STELLAR_PAY_TO_ADDRESS." };
  }

  if (!StrKey.isValidEd25519PublicKey(payToAddress)) {
    return { error: "NEXT_PUBLIC_STELLAR_PAY_TO_ADDRESS must be a valid Stellar G-address." };
  }

  if (!/^[a-zA-Z0-9]{1,12}$/.test(usdcAssetCode)) {
    return { error: "NEXT_PUBLIC_STELLAR_USDC_ASSET_CODE must be 1-12 alphanumeric characters." };
  }

  return {
    config: {
      serverUrl,
      horizonUrl,
      networkPassphrase: Networks.TESTNET,
      networkName,
      usdcAssetCode,
      usdcIssuer,
      payToAddress,
      explorerBaseUrl,
      defaultAmount,
    },
  };
}
