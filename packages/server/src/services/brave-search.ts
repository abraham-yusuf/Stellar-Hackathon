import { Env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

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

interface TavilySearchApiResponse {
  query: string;
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    published_date?: string;
  }>;
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
        "Sample documentation result for local demos when the Tavily API key is not configured.",
      age: "1 week ago",
    },
  ];

  logger.warn({ query }, "TAVILY_API_KEY not configured, returning mock search results");

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
  const apiKey = Env.tavilyApiKey;

  if (!apiKey) {
    return buildMockResults(query, count);
  }

  const body: Record<string, unknown> = {
    api_key: apiKey,
    query,
    max_results: count,
    search_depth: "basic",
  };

  if (opts.freshness) {
    const freshnessMap: Record<string, number> = {
      pd: 1,
      pw: 7,
      pm: 30,
      py: 365,
    };
    const days = freshnessMap[opts.freshness];
    if (days !== undefined) {
      body.days = days;
    }
  }

  const response = await fetch(TAVILY_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
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

    throw new Error(`Tavily Search API error (${response.status}): ${detail}`);
  }

  const payload = (await response.json()) as TavilySearchApiResponse;
  const results = (payload.results ?? [])
    .filter((entry): entry is Required<Pick<typeof entry, "title" | "url" | "content">> => {
      return Boolean(entry.title && entry.url && entry.content);
    })
    .slice(0, count)
    .map((entry) => ({
      title: entry.title,
      url: entry.url,
      description: entry.content,
      age: entry.published_date,
    }));

  return {
    query,
    count: results.length,
    results,
  };
}
