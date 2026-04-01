import { wrapFetchWithPayment, x402Client, x402HTTPClient } from "@x402/fetch";
import type { Network } from "@x402/core/types";
import { createEd25519Signer } from "./stellar/signer.js";
import { ExactStellarScheme } from "./stellar/exact/client/scheme.js";
import {
  STELLAR_PUBNET_CAIP2,
  STELLAR_TESTNET_CAIP2,
  STELLAR_WILDCARD_CAIP2,
} from "./stellar/constants.js";

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

export interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
  mock?: boolean;
}

const DEFAULT_MAINNET_RPC_URL = "https://mainnet.sorobanrpc.com";

function normalizeBaseUrl(rawUrl: string): string {
  return rawUrl.replace(/\/+$/, "");
}

function getRpcUrl(network: string): string | undefined {
  if (network === STELLAR_TESTNET_CAIP2) {
    return undefined;
  }

  if (network === STELLAR_PUBNET_CAIP2) {
    return DEFAULT_MAINNET_RPC_URL;
  }

  return undefined;
}

export function createSearchClient(config: {
  secretKey: string;
  network: string;
  searchApiUrl: string;
  facilitatorUrl?: string;
  facilitatorApiKey?: string;
}) {
  const network = config.network as Network;
  const signer = createEd25519Signer(config.secretKey, network);
  const scheme = new ExactStellarScheme(signer, { url: getRpcUrl(config.network) });
  const paymentClient = new x402Client().register(STELLAR_WILDCARD_CAIP2, scheme);
  const httpClient = new x402HTTPClient(paymentClient);
  const payingFetch = wrapFetchWithPayment(fetch, httpClient);

  async function search(
    query: string,
    options: { count?: number; freshness?: "d" | "w" | "m" | "y" } = {},
  ): Promise<SearchResponse> {
    const networkSuffix = config.network === STELLAR_PUBNET_CAIP2 ? "mainnet" : "testnet";
    const params = new URLSearchParams({
      q: query,
      count: String(options.count ?? 10),
    });

    if (options.freshness) {
      params.set("freshness", options.freshness);
    }

    const url = `${normalizeBaseUrl(config.searchApiUrl)}/search/${networkSuffix}?${params.toString()}`;
    const res = await payingFetch(url);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Search API error ${res.status}: ${body}`);
    }

    return res.json() as Promise<SearchResponse>;
  }

  return {
    search,
    walletAddress: signer.address,
    network,
    searchApiUrl: normalizeBaseUrl(config.searchApiUrl),
    facilitatorUrl: config.facilitatorUrl,
    facilitatorApiKeyConfigured: Boolean(config.facilitatorApiKey),
  };
}
