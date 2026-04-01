import { wrapFetchWithPayment, x402Client, x402HTTPClient } from "@x402/fetch";
import { createEd25519Signer } from "./stellar/signer.js";
import { ExactStellarScheme } from "./stellar/exact/client/scheme.js";
import type { Network } from "@x402/core/types";

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

export function createSearchClient(config: {
  secretKey: string;
  network: string;
  searchApiUrl: string;
  facilitatorUrl?: string;
}) {
  const signer = createEd25519Signer(config.secretKey, config.network as Network);
  const paymentClient = new x402Client().register("stellar:*", new ExactStellarScheme(signer));
  const httpClient = new x402HTTPClient(paymentClient);
  const payingFetch = wrapFetchWithPayment(fetch, httpClient);

  async function search(query: string, count = 10): Promise<SearchResponse> {
    const networkSuffix = config.network === "stellar:pubnet" ? "mainnet" : "testnet";
    const url = `${config.searchApiUrl}/search/${networkSuffix}?q=${encodeURIComponent(query)}&count=${count}`;
    const res = await payingFetch(url);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Search API error ${res.status}: ${body}`);
    }
    return res.json() as Promise<SearchResponse>;
  }

  return { search, walletAddress: signer.address };
}
