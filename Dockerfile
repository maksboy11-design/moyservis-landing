# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS production-dependencies
RUN npm prune --omit=dev

FROM dependencies AS web-build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next
RUN npm run build

FROM dependencies AS worker-build
COPY . .
RUN npm run build:mail-worker

FROM node:22-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=web-build --chown=nextjs:nodejs /app/package.json /app/package-lock.json ./
COPY --from=production-dependencies --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=web-build --chown=nextjs:nodejs /app/public ./public
COPY --from=web-build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=web-build --chown=nextjs:nodejs /app/next.config.ts ./
COPY --from=web-build --chown=nextjs:nodejs /app/scripts/assert-prod-build.mjs ./scripts/assert-prod-build.mjs

USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]

FROM node:22-alpine AS worker
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 worker

COPY --from=production-dependencies --chown=worker:nodejs /app/node_modules ./node_modules
COPY --chown=worker:nodejs package.json package-lock.json ./
COPY --from=worker-build --chown=worker:nodejs /app/dist/mail-worker.mjs ./dist/mail-worker.mjs

USER worker
CMD ["node", "dist/mail-worker.mjs"]
