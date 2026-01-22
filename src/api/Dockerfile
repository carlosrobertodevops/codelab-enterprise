# syntax=docker/dockerfile:1.6
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
RUN corepack enable
COPY src/api/package.json src/api/pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

FROM base AS dev
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY src/api ./
ENV NODE_ENV=development
EXPOSE 3001
CMD ["pnpm", "dev"]

FROM base AS builder
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY src/api ./
ENV NODE_ENV=production
RUN pnpm prisma:generate
RUN pnpm build
# also build worker entrypoint (simple copy)
RUN node -e "require('fs').copyFileSync('worker.ts','dist/worker.js')"

FROM base AS prod
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
