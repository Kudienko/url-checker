# Сборка
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app
COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @url-checker/shared build
RUN pnpm --filter @url-checker/backend build

# Рантайм
FROM node:20-alpine AS runtime
RUN corepack enable
WORKDIR /app
COPY --from=build /app/ ./
EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]
