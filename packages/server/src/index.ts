import "dotenv/config";
import { createApp } from "./app.js";
import { Env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const app = createApp();
app.listen(Env.port, () => {
  logger.info({ port: Env.port }, "StellarSearch server started");
  logger.info("Endpoints:");
  logger.info(`  GET /search/testnet?q=<query>   — 0.01 USDC on stellar:testnet`);
  logger.info(`  GET /search/mainnet?q=<query>   — 0.01 USDC on stellar:pubnet`);
  logger.info(`  GET /stats                       — query stats`);
  logger.info(`  GET /stats/live                  — SSE stream`);
  logger.info(`  GET /.well-known/x402            — x402 discovery`);
  logger.info(`  GET /health                      — health check`);
});
