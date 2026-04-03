FROM node:20-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/mcp/package.json ./packages/mcp/package.json

RUN pnpm install --frozen-lockfile --filter @stellarsearch/mcp...

COPY packages/mcp ./packages/mcp

WORKDIR /app/packages/mcp
ENV NODE_ENV=production

CMD ["pnpm", "start"]
