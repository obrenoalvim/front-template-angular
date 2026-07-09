# Dockerfile

# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholder env vars so `ng build` (route data collection) and the
# sitemap-generation step never fail on missing config — the real values are
# injected at container runtime.
ENV API_BASE_URL=https://api.example.com
ENV SITE_URL=https://example.com
RUN npm run build

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
ENV NODE_ENV=production
ENV PORT=4000
USER appuser
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1
CMD ["node", "dist/front-template-angular/server/server.mjs"]
