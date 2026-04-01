import { Env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search";

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  favicon?: string;
}

export interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
  mock?: boolean;
}

interface BraveSearchApiResponse {
  web?: {
    results?: Array<{
      title?: string;
      url?: string;
      description?: string;
      age?: string;
      profile?: {
        img?: string;
      };
      meta_url?: {
        favicon?: string;
      };
    }>;
  };
}

function buildMockResults(query: string, count: number): SearchResponse {
  const baseResults: SearchResult[] = [
    {
      title: `${query} | Stellar Developer Guide`,
      url: `https://example.com/search/${encodeURIComponent(query)}/stellar-guide`,
      description:
        `Mock result for "${query}" showing how StellarSearch returns normalized web search responses.`,
      age: "1 day ago",
    },
    {
      title: `${query} market and ecosystem overview`,
      url: `https://example.com/search/${encodeURIComponent(query)}/ecosystem-overview`,
      description:
        "Demonstration result covering agents, micropayments, and x402-enabled search monetization.",
      age: "3 days ago",
    },
    {
      title: `${query} integration walkthrough`,
      url: `https://example.com/search/${encodeURIComponent(query)}/integration-walkthrough`,
      description:
        "Sample documentation result for local demos when the Brave Search API key is not configured.",
      age: "1 week ago",
    },
  ];

  logger.warn({ query }, "BRAVE_SEARCH_API_KEY not configured, returning mock search results");

  return {
    query,
    count: Math.min(count, baseResults.length),
    results: baseResults.slice(0, count),
    mock: true,
  };
}

export async function search(
  query: string,
  opts: { count?: number; freshness?: string } = {},
): Promise<SearchResponse> {
  const count = Math.min(Math.max(opts.count ?? Env.searchResultsCount, 1), 20);
  const apiKey = Env.braveSearchApiKey;

  if (!apiKey) {
    return buildMockResults(query, count);
  }

  const params = new URLSearchParams({
    q: query,
    count: String(count),
    result_filter: "web",
  });

  if (opts.freshness) {
    params.set("freshness", opts.freshness);
  }

  const response = await fetch(`${BRAVE_SEARCH_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!response.ok) {
    let detail = response.statusText;

    try {
      const body = (await response.json()) as Record<string, unknown>;
      detail = JSON.stringify(body);
    } catch {
      try {
        detail = await response.text();
      } catch {
        detail = response.statusText;
      }
    }

    throw new Error(`Brave Search API error (${response.status}): ${detail}`);
  }

  const payload = (await response.json()) as BraveSearchApiResponse;
  const results = (payload.web?.results ?? [])
    .filter((entry): entry is Required<Pick<SearchResult, "title" | "url" | "description">> & typeof entry => {
      return Boolean(entry.title && entry.url && entry.description);
    })
    .slice(0, count)
    .map((entry) => ({
      title: entry.title,
      url: entry.url,
      description: entry.description,
      age: entry.age,
      favicon: entry.meta_url?.favicon ?? entry.profile?.img,
    }));

  return {
    query,
    count: results.length,
    results,
  };
}
