# syntax=docker/dockerfile:1.6

FROM node:22-alpine AS base
WORKDIR /app

# -----------------------------
# deps
# -----------------------------
FROM base AS deps
RUN corepack enable

# Monorepo: yarn.lock está na raiz do repositório
COPY yarn.lock ./yarn.lock
COPY src/api/package.json ./package.json

RUN yarn install --frozen-lockfile

# -----------------------------
# builder
# -----------------------------
FROM base AS builder
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/yarn.lock ./yarn.lock
COPY --from=deps /app/package.json ./package.json

# Copia o código da API
COPY src/api ./

# Prisma generate (ajuste para o script real do seu package.json)
# Se você não tiver "prisma:generate", substitua por: RUN yarn prisma generate
RUN yarn prisma:generate

# Build Nest
RUN yarn build

# -----------------------------
# runner
# -----------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
