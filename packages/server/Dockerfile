FROM node:20-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/server/package.json ./packages/server/package.json

RUN pnpm install --frozen-lockfile --filter @stellarsearch/server...

COPY packages/server ./packages/server

RUN pnpm --filter @stellarsearch/server build

WORKDIR /app/packages/server
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["pnpm", "start"]
