import { Router } from "express";
import { Env, NETWORK_META } from "../config/env.js";

const router = Router();

router.get("/.well-known/x402", (_req, res) => {
  const resources = Env.networksConfig.map((n) => `GET /search/${NETWORK_META[n.network].routeSuffix}`);
  res.json({
    version: 1,
    resources,
    description:
      `StellarSearch — pay-per-query web search API. ` +
      `${Env.paymentPrice} USDC per request. ` +
      `Query param: ?q=<search_query>&count=<1-20>. ` +
      `Returns JSON array of {title, url, description, age} results.`,
  });
});

export { router as discoveryRouter };
