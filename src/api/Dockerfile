# syntax=docker/dockerfile:1.6

FROM node:22-alpine AS base
WORKDIR /app

# -----------------------------
# deps
# -----------------------------
FROM base AS deps
RUN corepack enable

COPY src/api/package.json src/api/yarn.lock ./
RUN yarn install --frozen-lockfile

# -----------------------------
# builder
# -----------------------------
FROM base AS builder
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY src/api ./

# Prisma client (ajuste conforme seus scripts)
# Opção A: se existir "prisma:generate" no package.json
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
