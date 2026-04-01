import { Router } from "express";
import { Env, NETWORK_META } from "../config/env.js";
import { search } from "../services/brave-search.js";
import { logger } from "../utils/logger.js";
import { statsStore } from "./stats.js";

const router = Router();
const validSuffixes = new Set(Env.networksConfig.map((n) => NETWORK_META[n.network].routeSuffix));

router.get("/search/:network", async (req, res) => {
  if (!validSuffixes.has(req.params.network)) {
    res.status(404).json({ error: "Network not supported" });
    return;
  }

  const q = (req.query.q as string | undefined)?.trim();
  if (!q) {
    res.status(400).json({ error: "Missing required query parameter: q" });
    return;
  }

  const count = Math.min(
    Number.parseInt((req.query.count as string) || String(Env.searchResultsCount), 10) || Env.searchResultsCount,
    20,
  );

  const freshness = req.query.freshness as string | undefined;

  try {
    const result = await search(q, { count, freshness });

    statsStore.record({
      query: q,
      network: req.params.network,
      timestamp: new Date().toISOString(),
      txHash: res.getHeader("x-payment-tx-hash") as string | undefined,
    });

    res.json(result);
  } catch (err) {
    logger.error({ err, q }, "Search upstream error");
    res.status(502).json({ error: "Search service unavailable" });
  }
});

export { router as searchRouter };
