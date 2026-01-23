# syntax=docker/dockerfile:1.6

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# -----------------------------
# deps
# -----------------------------
FROM base AS deps
RUN corepack enable

# Copia manifests para maximizar cache
COPY src/app/package.json src/app/yarn.lock ./
RUN yarn install --frozen-lockfile

# -----------------------------
# builder
# -----------------------------
FROM base AS builder
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY src/app ./

RUN yarn build

# -----------------------------
# runner
# -----------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["yarn", "start", "-p", "3000"]
