# syntax=docker/dockerfile:1.6

FROM node:22-alpine AS base
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl ca-certificates && update-ca-certificates
RUN corepack enable

# -----------------------------
# deps
# -----------------------------
FROM base AS deps
WORKDIR /app

COPY src/app/package.json src/app/yarn.lock ./
RUN yarn install --frozen-lockfile

# -----------------------------
# builder
# -----------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src/app ./

RUN yarn prisma:generate
RUN yarn build

# -----------------------------
# runner
# -----------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Prisma engines (Alpine/musl)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["yarn", "start"]
