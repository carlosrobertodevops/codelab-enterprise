# syntax=docker/dockerfile:1.6

FROM node:22-alpine AS base
WORKDIR /app

# Alpine: TLS/CA + compat + openssl (evita falhas de download/SSL em prisma/yarn)
RUN apk add --no-cache libc6-compat openssl ca-certificates && update-ca-certificates

RUN corepack enable

# -----------------------------
# deps
# -----------------------------
FROM base AS deps
WORKDIR /app

COPY src/api/package.json src/api/yarn.lock ./
RUN yarn install --non-interactive

# -----------------------------
# builder
# -----------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src/api ./

# Prisma generate (API usa o client padrão do node_modules/.prisma + @prisma/client)
RUN yarn prisma:generate

# Build do Nest (gera /dist)
RUN yarn build

# -----------------------------
# runner
# -----------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# app runtime
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# ✅ Prisma engines (necessário no Alpine/musl)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
