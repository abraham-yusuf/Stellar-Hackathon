FROM node:20-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/web/package.json ./packages/web/package.json

RUN pnpm install --frozen-lockfile --filter @stellarsearch/web...

COPY packages/web ./packages/web

RUN pnpm --filter @stellarsearch/web build

WORKDIR /app/packages/web
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["pnpm", "start", "--", "-p", "3000", "-H", "0.0.0.0"]
