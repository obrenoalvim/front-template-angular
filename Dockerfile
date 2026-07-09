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
# API_BASE_URL is baked into the CLIENT bundle at build time (environment.ts)
# — it is NOT a true runtime env var like SITE_URL (used server-side for the
# Host allowlist) or PORT. The browser, not this container, makes API calls,
# so it needs a real, build-time-correct value here to actually reach a
# backend; --build-arg overrides these placeholders when you have one.
ARG API_BASE_URL=https://api.example.com
ARG SITE_URL=https://example.com
ENV API_BASE_URL=${API_BASE_URL}
ENV SITE_URL=${SITE_URL}
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
