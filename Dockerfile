# ============================================================
# HeatGuard — Multi-stage Dockerfile
# Stage 1: Build
# Stage 2: Production (minimal Node Alpine image)
# ============================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine AS runner

WORKDIR /app

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 heatguard

# Copy only what's needed to run
COPY --from=builder --chown=heatguard:nodejs /app/dist ./dist
COPY --from=builder --chown=heatguard:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=heatguard:nodejs /app/package.json ./package.json

USER heatguard

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "dist/index.js"]
