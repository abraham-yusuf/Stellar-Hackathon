# Resources
There are a number of emerging payment systems designed for the agentic economy. These include but are not limited to:

- x402 is a pay-per-request settlement protocol backed by Coinbase : https://www.x402.org
- MPP, backed by Stripe, can do pay-per-request, but can also set up a session-based system for bulk payments : https://docs.stripe.com/payments/machine/mpp

1. x402 is fully integrated on Stellar and the main repo includes tools, examples, and references: https://github.com/stellar/x402-stellar
2. There is a quickstart tutorial showing how to setup a x402 server and client here: https://developers.stellar.org/docs/build/apps/x402/quickstart-guide
3. This guide includes information on how to generate wallets using stellar lab and fund them with testnet funds (XLM and USDC). There are some test services you can play with using your testnet funds at https://xlm402.com which also serves as an [open-source example](https://github.com/jamesbachini/xlm402)
4. A demo MCP server is available which enables agents to pay for x402 services on Stellar testnet and mainnet using Claude Code, Codex or any other MCP enabled AI system: https://github.com/jamesbachini/x402-mcp-stellar
5. MPP was just released on the 18th March 2026 and there is already a SDK available for Stellar: https://github.com/stellar-experimental/stellar-mpp-sdk

## Stellar Dev Tools
1. Stellar Docs: https://developers.stellar.org/ Core documentation for building on Stellar (concepts, APIs, smart contracts, and guides).
2. SDKs: https://developers.stellar.org/docs/tools/sdks Libraries + docs to interact with the network and build apps in your preferred language.
3. Stellar CLI: https://developers.stellar.org/docs/tools/cli Build, deploy, and interact with Stellar smart contracts from the command line.
4. Lab: https://developers.stellar.org/docs/tools/lab Explore, test, and experiment with Stellar developer tools and APIs in the browser.
5. Quickstart: https://developers.stellar.org/docs/tools/quickstart Run a local Stellar network environment via Docker for development/testing.
6. Stellar Wallets Kit: https://stellarwalletskit.dev/ Plug-and-play wallet connections for Stellar apps with a simple unified API.
7. Scaffold Stellar: https://scaffoldstellar.org  CLI tool for the full Stellar app development lifecycle — smart contract management, testing, and deployment with best practices baked in.


## x402 / Agentic Payments
1. x402 on Stellar — Docs: https://developers.stellar.org/docs/build/apps/x402 Per-request HTTP payment protocol for AI agents. Client hits a paywalled endpoint, receives a 402, signs a Soroban auth entry, and retries with payment.
2. Built on Stellar x402 Facilitator: https://developers.stellar.org/docs/build/apps/x402/built-on-stellar The facilitator service that processes x402 payments on Stellar (powered by OpenZeppelin Relayer).
3. x402 Demo on Stellar: https://x402-stellar-491bf9f7e30b.herokuapp.com/ Live demo showing the x402 payment flow end-to-end.
4. Stellar Observatory: https://github.com/elliotfriend/stellar-observatory Get the latest space weather conditions with x402 on Stellar. Works on testnet and mainnet, and includes an MCP server. Live app: https://stellar-observatory.vercel.app
5. Stellar Sponsored Agent Account: https://github.com/oceans404/stellar-sponsored-agent-account Gives any AI agent a Stellar USDC wallet in less than a minute, without needing any XLM to start. Uses Stellar's native sponsorship protocol to cover the ~1.5 XLM account setup cost. Try it — tell Claude or your agent: Create a Stellar account for USDC. Check out this skill to learn how: https://stellar-sponsored-agent-account.onrender.com/SKILL.md


## Repos / SDKs
1. stellar/x402-stellar: https://github.com/stellar/x402-stellar Official monorepo — facilitator service, simple-paywall demo (Express + React), Heroku deployment config, and channel account setup.
2. @x402/stellar on npm npm package for integrating x402 payments into your Stellar app.
3. stellar-experimental/stellar-mpp-sdk: https://github.com/stellar-experimental/stellar-mpp-sdk Experimental SDK for Stellar machine-payable payments.
4. stripe-samples/machine-payments: https://github.com/stripe-samples/machine-payments Stripe's reference implementation for machine-to-machine payments.

## Protocol References
1. Coinbase x402 Docs: https://docs.cdp.coinbase.com/x402/docs/welcome Coinbase's documentation for the x402 protocol.
2. x402 Protocol: https://www.x402.org/ The x402 protocol specification.
3. Stripe Machine Payments: https://stripe.com/machine-payments Stripe's machine payments product page.
4. Stripe MPP Docs: https://docs.stripe.com/machine-payments Documentation for Stripe's machine-payable payments integration.
5. Stripe MPP Quickstart: https://docs.stripe.com/machine-payments/quickstart Get started with Stripe machine payments in minutes.

## Helpful Stellar Building Blocks
1. Contract Accounts: https://developers.stellar.org/docs/build/guides/conventions/contract-accounts How contract accounts work on Stellar — essential for x402 facilitator patterns.
2. Contract Authorization: https://developers.stellar.org/docs/build/guides/conventions/authorization Soroban's authorization model — required reading for signing auth entries in x402 flows.


## Anchor Integration Starter Pack
1. Anchor starter pack (code): https://github.com/ElliotFriend/regional-starter-pack SvelteKit reference app with a portable TypeScript anchor library. The /src/lib/anchors/ folder is framework-agnostic — copy it into any TypeScript or Node project. Includes client implementations for Etherfuse, AlfredPay, and BlindPay. Implements SEP-1, SEP-6, SEP-10, SEP-12, SEP-24, SEP-31, and SEP-38. Ships with pre-configured MCP servers for Claude Code. A good starting point for any fiat on/off-ramp integration.

## Reference Implementations (Code)
1. Ya Otter Save (fiat savings flow): https://github.com/briwylde08/ya-otter-save Complete testnet demo: fiat on-ramp → stablebonds → Stellar DEX swap → USDC → Blend deposit (yield), with the reverse path for withdrawal. TypeScript/Next.js. Shows how Etherfuse, the Stellar DEX, and Blend compose end-to-end.
2. Stellar DeFi App (mainnet dashboard): https://github.com/kaankacar/stellar-defi-app Full DeFi dashboard integrating Blend, Soroswap, Phoenix, Aquarius, SDEX, and Reflector Oracle. Most useful for seeing how protocols compose — actual API call shapes, response formats, and wiring.
3. AI Freighter Integration: https://github.com/carstenjacobsen/ai-freighter-integration Freighter wallet connection, XLM balance display, send payments, transaction history. Next.js + TypeScript. Includes BUILD_REPORT.md.
4. AI Soroswap Integration: https://github.com/carstenjacobsen/ai-soroswap-integration Multi-DEX swap aggregator routing across Soroswap, Phoenix, Aqua, and SDEX simultaneously.
5. AI DeFindex Integration: https://github.com/carstenjacobsen/ai-defindex-integration DeFindex yield vault deposits/withdrawals and dfToken balance tracking.
6. AI Passkeys Integration: https://github.com/carstenjacobsen/ai-passkeys-integration WebAuthn passkey smart wallet with Etherfuse fiat on/off-ramp.
7. AI Etherfuse Integration: https://github.com/carstenjacobsen/ai-etherfuse-integration Full Etherfuse ramp integration combined with DeFindex yield and Freighter wallet in a single three-tab app.
8. x402 Community Demo (jamesbachini): https://github.com/jamesbachini/x402-Stellar-Demo Minimal local demo showing payer client + protected Express server + local facilitator. Good for understanding the x402 flow end-to-end.

## AI Development Assistance
1. Stellar Dev Skills: https://github.com/stellar/stellar-dev-skill AI skill for modern Stellar development — covers Soroban, SDKs, RPC, wallet integration, passkeys, and security patterns. Invoke with stellar-dev:stellar-dev in Claude Code.
2. OpenZeppelin Skills: https://github.com/OpenZeppelin/openzeppelin-skills Claude Code skills for secure Stellar contract development. Install: /plugin marketplace add OpenZeppelin/openzeppelin-skills. Includes an MCP server for AI-assisted contract generation.
3. llms.txt: https://developers.stellar.org/llms.txt Machine-readable Stellar docs digest designed for feeding into any LLM.
4. Smart Account Kit: https://github.com/kalepail/smart-account-kit TypeScript SDK for building passkey smart wallets on Soroban — createWallet, connectWallet, signAndSubmit, gasless tx via OZ Relayer.
5. Stellar MCP Server: https://github.com/kalepail/stellar-mcp-server MCP server exposing Stellar wallet, token, and contract tools to Claude and other AI clients.
6. XDR MCP: https://github.com/stellar-experimental/mcp-stellar-xdr MCP server that decodes and encodes Stellar XDR to/from JSON for AI agents.
7. OpenZeppelin on Stellar: https://www.openzeppelin.com/networks/stellar Audited contract library, Contracts Wizard, Contracts MCP server, Relayer, Monitor, and Soroban Security Detectors SDK.

## Free AI Setup
1. Full guide with local models, free cloud APIs, and VPS rental: https://github.com/kaankacar/stellar-ai-guide-mx/blob/main/Free_AI_Setup.md Covers Ollama + Claude Code setup, free cloud options (OpenRouter, Groq, Mistral Codestral, Google AI Studio), and GPU rental on RunPod/Vast.ai for a few dollars.

## Community Resources
1. Stellar Hackathon FAQ: https://github.com/briwylde08/stellar-hackathon-faq Community-compiled FAQ from building with anchors and DeFi protocols.
2. Stellar DeFi Gotchas: https://github.com/kaankacar/stellar-defi-gotchas 400+ findings from 60 vibe-coding runs, organized by protocol.
3. Stellar Ecosystem DB: https://github.com/lumenloop/stellar-ecosystem-db Structured database of 646 Stellar projects with categories, contracts, and GitHub links. Useful for finding existing work before building from scratch.
4. Stellar Ecosystem Resources: https://github.com/stellar/ecosystem-resources/ Workshop activations, reference guides for Soroban, wallet integration, DeFi protocols, OpenZeppelin, tokens, and security.

## Ideas & Inspiration
The following are some ideas to get your mind thinking. This is an open innovation hackathon so you are free to pick your own idea and run with it.

- ### Private x402 payments
Privacy pool for x402 payments with pre-funding, operator-managed settlement, and batched facilitator withdrawals for efficiency.

- ### Paid agent services / APIs
Pay-per-token AI inferencePay-per-query searchFinancial market dataTrading signalsSecurity vulnerability scanningWeb scraping / data collectionReal-time news feedsPay-per-article news accessBlockchain indexingPay-per-second computeIoT automationPay-per-move online games

- ### Agent wallets, coordination, and commerce
Agent wallet integrationsAgent-to-agent communication and paymentsAgent marketplaces / service discoveryRating, reputation, and trust systems

- ### Infrastructure / ecosystem tooling
Bazaar-style discoverability for x402 servicesBazaar-enabled Stellar facilitatorMainnet-ready facilitator infrastructure for service listing and discovery

- ### Security and controls
Prompt injection defensesSandboxed executionOther safety features for autonomous agents

- ### Onchain finance and governance
DeFi integrationsAI fund managersDAO / governance experiments

- ### Concrete demand signals / real user pain points
Pay-per-query web search instead of monthly subscriptionsExample: search access for agent workflows like OpenClaw using a service such as Brave Search on a usage basis
