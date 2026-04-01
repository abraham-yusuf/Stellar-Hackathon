import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { Env } from "./config/env.js";
import { createSearchPaymentMiddlewares } from "./middleware/payment.js";
import { discoveryRouter } from "./routes/discovery.js";
import { healthRouter } from "./routes/health.js";
import { searchRouter } from "./routes/search.js";
import { statsRouter } from "./routes/stats.js";
import { logger, httpLogger } from "./utils/logger.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: Env.corsOrigins }));
  app.use(helmet());
  app.use(httpLogger);

  app.use(healthRouter);
  app.use(discoveryRouter);
  app.use(statsRouter);

  if (Env.paywallDisabled) {
    logger.warn("Paywall disabled — payments not required");
  } else {
    const middlewares = createSearchPaymentMiddlewares();
    for (const mw of middlewares) {
      app.use(mw.handler);
      logger.info({ route: `GET ${mw.routePath}` }, "Registered paid search route");
    }
  }

  app.use(searchRouter);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    void _next;
    logger.error({ err }, "Unhandled error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
    return;
  });

  return app;
}
