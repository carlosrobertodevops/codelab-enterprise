# syntax=docker/dockerfile:1.6
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN corepack enable
COPY src/app/package.json src/app/pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

FROM base AS dev
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY src/app ./
ENV NODE_ENV=development
EXPOSE 3000
CMD ["pnpm", "dev", "--hostname", "0.0.0.0", "--port", "3000"]

FROM base AS builder
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY src/app ./
ENV NODE_ENV=production
RUN pnpm build

FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["pnpm", "start", "--hostname", "0.0.0.0", "--port", "3000"]
