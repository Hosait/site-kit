# Produksjonsimage for Hosait. Bygges uten database: sidene genereres ved første besøk
# og caches til innholdet endres i CMS-et.
FROM node:24-alpine AS base
RUN corepack enable pnpm

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Byggesteget trenger verdier, men aldri ekte hemmeligheter.
ENV PAYLOAD_SECRET=build-only DATABASE_URL=postgres://build:build@127.0.0.1:1/build
RUN pnpm build
# Landdatabasen (pnpm-symlenke) som vanlig fil, til runner-steget.
RUN mkdir -p data && cp -L node_modules/@ip-location-db/geo-whois-asn-country-mmdb/geo-whois-asn-country.mmdb data/geo-country.mmdb

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
# Innhold for å fylle en tom testinstallasjon (se src/app/(frontend)/next/seed).
COPY --from=builder /app/seed ./seed
# Landdatabase til besøksanalysen (IP → land; CC0). Se src/lib/analytics/geo.ts.
COPY --from=builder /app/data/geo-country.mmdb ./data/geo-country.mmdb
# uploads/: bilder og dokumenter når S3 ikke er satt opp (eget volum i docker-compose.hosait.yml).
RUN mkdir -p .next uploads/media uploads/documents && chown -R nextjs:nodejs .next uploads
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["node", "server.js"]
