# syntax=docker/dockerfile:1.6

FROM node:22-alpine AS base
WORKDIR /app

# Prisma runtime deps (alpine/musl)
RUN apk add --no-cache libc6-compat openssl

# -----------------------------
# deps
# -----------------------------
FROM base AS deps
RUN corepack enable

# Copia manifests para maximizar cache
COPY src/api/package.json src/api/yarn.lock ./

# ✅ DEV build: não travar por lockfile desatualizado
RUN yarn install --non-interactive

# -----------------------------
# builder
# -----------------------------
FROM base AS builder
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY src/api ./

# Prisma exige DATABASE_URL durante generate (pode ser dummy no build)
ARG DATABASE_URL="postgresql://codelab:codelab@postgres:5432/codelab?schema=public"
ENV DATABASE_URL=${DATABASE_URL}

# Prisma client
RUN yarn prisma:generate

# Build Nest
RUN yarn build

# -----------------------------
# runner
# -----------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat openssl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
