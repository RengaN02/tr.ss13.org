FROM oven/bun:alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json bun.lock .
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN bun run build --experimental-build-mode compile

FROM base AS runner

RUN apk add --no-cache curl

COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/.next/static .next/static
RUN mkdir .next/cache && chmod 777 .next/cache

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

ENV PRODUCTION_URL=https://ss13.tr
ENV CDN_URL=https://cdn.ss13.tr
ENV API_URL=https://api.ss13.tr
ENV API_KEY=hello

USER bun
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "server.js" ]

HEALTHCHECK CMD curl -f http://localhost:3000/ || exit 1
