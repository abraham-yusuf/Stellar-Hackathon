export const STELLAR_TESTNET_CAIP2 = "stellar:testnet";
export const STELLAR_PUBNET_CAIP2 = "stellar:pubnet";

export type StellarNetwork =
  | typeof STELLAR_TESTNET_CAIP2
  | typeof STELLAR_PUBNET_CAIP2;

export interface NetworkConfig {
  network: StellarNetwork;
  serverStellarAddress: string;
  stellarRpcUrl: string;
  facilitatorUrl: string;
  facilitatorApiKey: string | undefined;
}

const DEFAULT_PORT = 3001;
const DEFAULT_PAYMENT_PRICE = "0.01";
const DEFAULT_RESULTS_COUNT = 10;
const DEFAULT_LOG_LEVEL = "info";

function readVar(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCorsOrigins(value: string | undefined): string | string[] {
  if (!value) {
    return "*";
  }

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length <= 1) {
    return origins[0] ?? "*";
  }

  return origins;
}

function buildNetworkConfig(network: StellarNetwork): NetworkConfig | undefined {
  const isTestnet = network === STELLAR_TESTNET_CAIP2;
  const addressKey = isTestnet
    ? "TESTNET_SERVER_STELLAR_ADDRESS"
    : "MAINNET_SERVER_STELLAR_ADDRESS";
  const facilitatorUrlKey = isTestnet
    ? "TESTNET_FACILITATOR_URL"
    : "MAINNET_FACILITATOR_URL";
  const facilitatorApiKeyKey = isTestnet
    ? "TESTNET_FACILITATOR_API_KEY"
    : "MAINNET_FACILITATOR_API_KEY";
  const rpcUrlKey = isTestnet ? "TESTNET_STELLAR_RPC_URL" : "MAINNET_STELLAR_RPC_URL";

  const serverStellarAddress = readVar(addressKey);
  if (!serverStellarAddress) {
    return undefined;
  }

  const meta = NETWORK_META[network];

  return {
    network,
    serverStellarAddress,
    stellarRpcUrl: readVar(rpcUrlKey) ?? meta.defaultRpcUrl,
    facilitatorUrl: readVar(facilitatorUrlKey) ?? defaultFacilitatorUrl(network),
    facilitatorApiKey: readVar(facilitatorApiKeyKey),
  };
}

function defaultFacilitatorUrl(network: StellarNetwork): string {
  return network === STELLAR_TESTNET_CAIP2
    ? "https://channels.openzeppelin.com/x402/testnet"
    : "https://channels.openzeppelin.com/x402/mainnet";
}

export class Env {
  static get nodeEnv(): string {
    return readVar("NODE_ENV") ?? "development";
  }

  static get isDevelopment(): boolean {
    return Env.nodeEnv !== "production";
  }

  static get port(): number {
    return parseNumber(readVar("PORT"), DEFAULT_PORT);
  }

  static get tavilyApiKey(): string | undefined {
    return readVar("TAVILY_API_KEY");
  }

  static get paymentPrice(): string {
    return readVar("PAYMENT_PRICE") ?? DEFAULT_PAYMENT_PRICE;
  }

  static get searchResultsCount(): number {
    return clamp(parseNumber(readVar("SEARCH_RESULTS_COUNT"), DEFAULT_RESULTS_COUNT), 1, 20);
  }

  static get paywallDisabled(): boolean {
    return readVar("PAYWALL_DISABLED") === "true";
  }

  static get corsOrigins(): string | string[] {
    return parseCorsOrigins(readVar("CORS_ORIGINS"));
  }

  static get logLevel(): string {
    return readVar("LOG_LEVEL") ?? DEFAULT_LOG_LEVEL;
  }

  static get networksConfig(): NetworkConfig[] {
    return [STELLAR_TESTNET_CAIP2, STELLAR_PUBNET_CAIP2]
      .map((network) => buildNetworkConfig(network))
      .filter((config): config is NetworkConfig => Boolean(config));
  }
}

export const NETWORK_META: Record<
  StellarNetwork,
  { routeSuffix: string; displayName: string; defaultRpcUrl: string }
> = {
  "stellar:testnet": {
    routeSuffix: "testnet",
    displayName: "Testnet",
    defaultRpcUrl: "https://soroban-testnet.stellar.org",
  },
  "stellar:pubnet": {
    routeSuffix: "mainnet",
    displayName: "Mainnet",
    defaultRpcUrl: "https://mainnet.sorobanrpc.com",
  },
};
