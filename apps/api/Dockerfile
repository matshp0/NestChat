FROM node:20-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api --docker

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN npm ci

COPY --from=pruner /app/out/full/ .

RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

RUN npx turbo run build --filter=...api

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/packages ./packages

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main"]
