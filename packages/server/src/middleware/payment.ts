import type { RequestHandler } from "express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactStellarScheme } from "@x402/stellar/exact/server";
import { Env, NETWORK_META, type NetworkConfig } from "../config/env.js";

export interface NetworkMiddleware {
  network: string;
  routePath: string;
  handler: RequestHandler;
}

function buildSearchMiddleware(netConfig: NetworkConfig): NetworkMiddleware {
  const facilitatorClient = new HTTPFacilitatorClient({
    url: netConfig.facilitatorUrl,
    createAuthHeaders: netConfig.facilitatorApiKey
      ? async () => {
          const h = { Authorization: `Bearer ${netConfig.facilitatorApiKey}` };
          return { verify: h, settle: h, supported: h };
        }
      : undefined,
  });

  const x402Server = new x402ResourceServer(facilitatorClient).register(
    netConfig.network,
    new ExactStellarScheme(),
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
            payTo: netConfig.serverStellarAddress,
          },
        ],
        description: `StellarSearch — pay-per-query web search API. ${Env.paymentPrice} USDC per request.`,
      },
    },
    x402Server,
    undefined,
    undefined,
    true,
  );

  return { network: netConfig.network, routePath, handler };
}

export function createSearchPaymentMiddlewares(): NetworkMiddleware[] {
  return Env.networksConfig.map(buildSearchMiddleware);
}
