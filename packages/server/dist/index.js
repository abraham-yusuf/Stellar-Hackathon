// src/index.ts
import "dotenv/config";

// src/app.ts
import cors from "cors";
import express from "express";
import helmet from "helmet";

// src/config/env.ts
var STELLAR_TESTNET_CAIP2 = "stellar:testnet";
var STELLAR_PUBNET_CAIP2 = "stellar:pubnet";
var DEFAULT_PORT = 3001;
var DEFAULT_PAYMENT_PRICE = "0.01";
var DEFAULT_RESULTS_COUNT = 10;
var DEFAULT_LOG_LEVEL = "info";
function readVar(key) {
  const value = process.env[key]?.trim();
  return value ? value : void 0;
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function parseNumber(value, fallback) {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function parseCorsOrigins(value) {
  if (!value) {
    return "*";
  }
  const origins = value.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (origins.length <= 1) {
    return origins[0] ?? "*";
  }
  return origins;
}
function buildNetworkConfig(network) {
  const isTestnet = network === STELLAR_TESTNET_CAIP2;
  const addressKey = isTestnet ? "TESTNET_SERVER_STELLAR_ADDRESS" : "MAINNET_SERVER_STELLAR_ADDRESS";
  const facilitatorUrlKey = isTestnet ? "TESTNET_FACILITATOR_URL" : "MAINNET_FACILITATOR_URL";
  const facilitatorApiKeyKey = isTestnet ? "TESTNET_FACILITATOR_API_KEY" : "MAINNET_FACILITATOR_API_KEY";
  const rpcUrlKey = isTestnet ? "TESTNET_STELLAR_RPC_URL" : "MAINNET_STELLAR_RPC_URL";
  const serverStellarAddress = readVar(addressKey);
  if (!serverStellarAddress) {
    return void 0;
  }
  const meta = NETWORK_META[network];
  return {
    network,
    serverStellarAddress,
    stellarRpcUrl: readVar(rpcUrlKey) ?? meta.defaultRpcUrl,
    facilitatorUrl: readVar(facilitatorUrlKey) ?? defaultFacilitatorUrl(network),
    facilitatorApiKey: readVar(facilitatorApiKeyKey)
  };
}
function defaultFacilitatorUrl(network) {
  return network === STELLAR_TESTNET_CAIP2 ? "https://channels.openzeppelin.com/x402/testnet" : "https://channels.openzeppelin.com/x402/mainnet";
}
var Env = class _Env {
  static get nodeEnv() {
    return readVar("NODE_ENV") ?? "development";
  }
  static get isDevelopment() {
    return _Env.nodeEnv !== "production";
  }
  static get port() {
    return parseNumber(readVar("PORT"), DEFAULT_PORT);
  }
  static get braveSearchApiKey() {
    return readVar("BRAVE_SEARCH_API_KEY");
  }
  static get paymentPrice() {
    return readVar("PAYMENT_PRICE") ?? DEFAULT_PAYMENT_PRICE;
  }
  static get searchResultsCount() {
    return clamp(parseNumber(readVar("SEARCH_RESULTS_COUNT"), DEFAULT_RESULTS_COUNT), 1, 20);
  }
  static get paywallDisabled() {
    return readVar("PAYWALL_DISABLED") === "true";
  }
  static get corsOrigins() {
    return parseCorsOrigins(readVar("CORS_ORIGINS"));
  }
  static get logLevel() {
    return readVar("LOG_LEVEL") ?? DEFAULT_LOG_LEVEL;
  }
  static get networksConfig() {
    return [STELLAR_TESTNET_CAIP2, STELLAR_PUBNET_CAIP2].map((network) => buildNetworkConfig(network)).filter((config) => Boolean(config));
  }
};
var NETWORK_META = {
  "stellar:testnet": {
    routeSuffix: "testnet",
    displayName: "Testnet",
    defaultRpcUrl: "https://soroban-testnet.stellar.org"
  },
  "stellar:pubnet": {
    routeSuffix: "mainnet",
    displayName: "Mainnet",
    defaultRpcUrl: "https://mainnet.sorobanrpc.com"
  }
};

// src/middleware/payment.ts
import { HTTPFacilitatorClient } from "@x402/core/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactStellarScheme } from "@x402/stellar/exact/server";
function buildSearchMiddleware(netConfig) {
  const facilitatorClient = new HTTPFacilitatorClient({
    url: netConfig.facilitatorUrl,
    createAuthHeaders: netConfig.facilitatorApiKey ? async () => {
      const h = { Authorization: `Bearer ${netConfig.facilitatorApiKey}` };
      return { verify: h, settle: h, supported: h };
    } : void 0
  });
  const x402Server = new x402ResourceServer(facilitatorClient).register(
    netConfig.network,
    new ExactStellarScheme()
  );
  const { routeSuffix } = NETWORK_META[netConfig.network];
  const routePath = `/search/${routeSuffix}`;
  const handler = paymentMiddleware(
    {
      [`GET ${routePath}`]: {
        accepts: [
          {
            scheme: "exact",
            price: Env.paymentPrice,
            network: netConfig.network,
            payTo: netConfig.serverStellarAddress
          }
        ],
        description: `StellarSearch \u2014 pay-per-query web search API. ${Env.paymentPrice} USDC per request.`
      }
    },
    x402Server,
    void 0,
    void 0,
    true
  );
  return { network: netConfig.network, routePath, handler };
}
function createSearchPaymentMiddlewares() {
  return Env.networksConfig.map(buildSearchMiddleware);
}

// src/routes/discovery.ts
import { Router } from "express";
var router = Router();
router.get("/.well-known/x402", (_req, res) => {
  const resources = Env.networksConfig.map((n) => `GET /search/${NETWORK_META[n.network].routeSuffix}`);
  res.json({
    version: 1,
    resources,
    description: `StellarSearch \u2014 pay-per-query web search API. ${Env.paymentPrice} USDC per request. Query param: ?q=<search_query>&count=<1-20>. Returns JSON array of {title, url, description, age} results.`
  });
});

// src/routes/health.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});

// src/routes/search.ts
import { Router as Router4 } from "express";

// src/utils/logger.ts
import pino from "pino";
import pinoHttp from "pino-http";
var logger = pino({
  level: Env.logLevel,
  transport: Env.isDevelopment ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname"
    }
  } : void 0
});
var httpLogger = pinoHttp({
  logger,
  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) {
      return "error";
    }
    if (res.statusCode >= 400) {
      return "warn";
    }
    return "info";
  }
});

// src/services/brave-search.ts
var BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search";
function buildMockResults(query, count) {
  const baseResults = [
    {
      title: `${query} | Stellar Developer Guide`,
      url: `https://example.com/search/${encodeURIComponent(query)}/stellar-guide`,
      description: `Mock result for "${query}" showing how StellarSearch returns normalized web search responses.`,
      age: "1 day ago"
    },
    {
      title: `${query} market and ecosystem overview`,
      url: `https://example.com/search/${encodeURIComponent(query)}/ecosystem-overview`,
      description: "Demonstration result covering agents, micropayments, and x402-enabled search monetization.",
      age: "3 days ago"
    },
    {
      title: `${query} integration walkthrough`,
      url: `https://example.com/search/${encodeURIComponent(query)}/integration-walkthrough`,
      description: "Sample documentation result for local demos when the Brave Search API key is not configured.",
      age: "1 week ago"
    }
  ];
  logger.warn({ query }, "BRAVE_SEARCH_API_KEY not configured, returning mock search results");
  return {
    query,
    count: Math.min(count, baseResults.length),
    results: baseResults.slice(0, count),
    mock: true
  };
}
async function search(query, opts = {}) {
  const count = Math.min(Math.max(opts.count ?? Env.searchResultsCount, 1), 20);
  const apiKey = Env.braveSearchApiKey;
  if (!apiKey) {
    return buildMockResults(query, count);
  }
  const params = new URLSearchParams({
    q: query,
    count: String(count),
    result_filter: "web"
  });
  if (opts.freshness) {
    params.set("freshness", opts.freshness);
  }
  const response = await fetch(`${BRAVE_SEARCH_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey
    }
  });
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
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
  const payload = await response.json();
  const results = (payload.web?.results ?? []).filter((entry) => {
    return Boolean(entry.title && entry.url && entry.description);
  }).slice(0, count).map((entry) => ({
    title: entry.title,
    url: entry.url,
    description: entry.description,
    age: entry.age,
    favicon: entry.meta_url?.favicon ?? entry.profile?.img
  }));
  return {
    query,
    count: results.length,
    results
  };
}

// src/routes/stats.ts
import { Router as Router3 } from "express";
var StatsStore = class {
  records = [];
  subscribers = /* @__PURE__ */ new Set();
  record(entry) {
    this.records.push(entry);
    if (this.records.length > 500) {
      this.records = this.records.slice(-500);
    }
    this.broadcast(entry);
  }
  getStats() {
    const now = Date.now();
    const last24hBoundary = now - 24 * 60 * 60 * 1e3;
    const queriesLast24h = this.records.filter((record) => {
      const time = Date.parse(record.timestamp);
      return Number.isFinite(time) && time >= last24hBoundary;
    }).length;
    return {
      totalQueries: this.records.length,
      queriesLast24h,
      recentQueries: this.records.slice(-50).reverse()
    };
  }
  subscribe(res) {
    this.subscribers.add(res);
    res.write(`data: ${JSON.stringify({ type: "connected", timestamp: (/* @__PURE__ */ new Date()).toISOString() })}

`);
  }
  unsubscribe(res) {
    this.subscribers.delete(res);
  }
  broadcast(entry) {
    const message = `data: ${JSON.stringify(entry)}

`;
    for (const subscriber of this.subscribers) {
      subscriber.write(message);
    }
  }
};
var statsStore = new StatsStore();
var router3 = Router3();
router3.get("/stats", (_req, res) => {
  res.json(statsStore.getStats());
});
router3.get("/stats/live", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  statsStore.subscribe(res);
  req.on("close", () => {
    statsStore.unsubscribe(res);
    res.end();
  });
});

// src/routes/search.ts
var router4 = Router4();
var validSuffixes = new Set(Env.networksConfig.map((n) => NETWORK_META[n.network].routeSuffix));
router4.get("/search/:network", async (req, res) => {
  if (!validSuffixes.has(req.params.network)) {
    res.status(404).json({ error: "Network not supported" });
    return;
  }
  const q = req.query.q?.trim();
  if (!q) {
    res.status(400).json({ error: "Missing required query parameter: q" });
    return;
  }
  const count = Math.min(
    Number.parseInt(req.query.count || String(Env.searchResultsCount), 10) || Env.searchResultsCount,
    20
  );
  const freshness = req.query.freshness;
  try {
    const result = await search(q, { count, freshness });
    statsStore.record({
      query: q,
      network: req.params.network,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      txHash: res.getHeader("x-payment-tx-hash")
    });
    res.json(result);
  } catch (err) {
    logger.error({ err, q }, "Search upstream error");
    res.status(502).json({ error: "Search service unavailable" });
  }
});

// src/app.ts
function createApp() {
  const app2 = express();
  app2.use(cors({ origin: Env.corsOrigins }));
  app2.use(helmet());
  app2.use(httpLogger);
  app2.use(router2);
  app2.use(router);
  app2.use(router3);
  if (Env.paywallDisabled) {
    logger.warn("Paywall disabled \u2014 payments not required");
  } else {
    const middlewares = createSearchPaymentMiddlewares();
    for (const mw of middlewares) {
      app2.use(mw.handler);
      logger.info({ route: `GET ${mw.routePath}` }, "Registered paid search route");
    }
  }
  app2.use(router4);
  app2.use((err, _req, res, _next) => {
    void _next;
    logger.error({ err }, "Unhandled error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
    return;
  });
  return app2;
}

// src/index.ts
var app = createApp();
app.listen(Env.port, () => {
  logger.info({ port: Env.port }, "StellarSearch server started");
  logger.info("Endpoints:");
  logger.info(`  GET /search/testnet?q=<query>   \u2014 0.01 USDC on stellar:testnet`);
  logger.info(`  GET /search/mainnet?q=<query>   \u2014 0.01 USDC on stellar:pubnet`);
  logger.info(`  GET /stats                       \u2014 query stats`);
  logger.info(`  GET /stats/live                  \u2014 SSE stream`);
  logger.info(`  GET /.well-known/x402            \u2014 x402 discovery`);
  logger.info(`  GET /health                      \u2014 health check`);
});
