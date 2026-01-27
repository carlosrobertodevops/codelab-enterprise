# # syntax=docker/dockerfile:1.6

# FROM node:22-alpine AS base
# WORKDIR /app

# # -----------------------------
# # deps
# # -----------------------------
# FROM base AS deps
# RUN corepack enable

# # Copia manifests para maximizar cache
# COPY src/api/package.json src/api/yarn.lock ./
# RUN yarn install --frozen-lockfile

# # -----------------------------
# # builder
# # -----------------------------
# FROM base AS builder
# RUN corepack enable

# COPY --from=deps /app/node_modules ./node_modules
# COPY src/api ./

# # Prisma client (ajuste conforme seu package.json)
# # Se você NÃO tiver "prisma:generate", troque por: RUN yarn prisma generate
# RUN yarn prisma:generate

# # Build Nest
# RUN yarn build

# # -----------------------------
# # runner
# # -----------------------------
# FROM node:22-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production

# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/prisma ./prisma

# EXPOSE 3001
# CMD ["node", "dist/main.js"]

# syntax=docker/dockerfile:1.6

# syntax=docker/dockerfile:1.6

FROM node:22-alpine AS base
WORKDIR /app

# Prisma (Node-alpine) precisa de libs de runtime para os engines (musl)
RUN apk add --no-cache libc6-compat openssl

# -----------------------------
# deps
# -----------------------------
FROM base AS deps
RUN corepack enable

# Copia manifests para maximizar cache
COPY src/api/package.json src/api/yarn.lock ./
RUN yarn install --frozen-lockfile

# -----------------------------
# builder
# -----------------------------
FROM base AS builder
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY src/api ./

# Prisma exige que DATABASE_URL exista durante o generate.
# Não precisa ser um banco real na etapa de build — só precisa estar setado.
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

# Prisma runtime deps
RUN apk add --no-cache libc6-compat openssl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
