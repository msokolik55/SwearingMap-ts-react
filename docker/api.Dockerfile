# syntax=docker/dockerfile:1.7

FROM node:24.14.0-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/map/package.json apps/map/package.json
COPY apps/web/package.json apps/web/package.json
COPY .husky/install.mjs .husky/install.mjs
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store && pnpm install --frozen-lockfile

COPY . .
RUN pnpm nx prune api

FROM node:24.14.0-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

RUN corepack enable

COPY --from=build /app/dist/apps/api/package.json ./
COPY --from=build /app/dist/apps/api/pnpm-lock.yaml ./
COPY --from=build /app/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store && pnpm install --prod --frozen-lockfile

COPY --from=build --chown=node:node /app/dist/apps/api/main.js ./
COPY --from=build --chown=node:node /app/dist/apps/api/main.js.map ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:3000/api/v1/health || exit 1

CMD ["node", "main.js"]
