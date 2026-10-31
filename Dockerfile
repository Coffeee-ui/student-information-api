# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Base stage: Pin Node version and setup pnpm package manager
# -----------------------------------------------------------------------------
FROM node:22.14.0-alpine3.21 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack and activate the pinned pnpm version matching package.json
RUN corepack enable && corepack prepare pnpm@12.15.0 --activate

WORKDIR /app

# -----------------------------------------------------------------------------
# Dependencies stage: Install all dependencies (prod + dev)
# -----------------------------------------------------------------------------
FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Builder stage: Compile TypeScript into JavaScript (dist)
# -----------------------------------------------------------------------------
FROM dependencies AS builder

WORKDIR /app
COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

# -----------------------------------------------------------------------------
# Production dependencies stage: Install production dependencies only
# -----------------------------------------------------------------------------
FROM base AS prod-dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# -----------------------------------------------------------------------------
# Development stage: Used by docker-compose for live development & hot-reloading
# -----------------------------------------------------------------------------
FROM dependencies AS development

WORKDIR /app
ENV NODE_ENV=development
ENV PORT=3000

# Ensure node user owns the app directory
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["pnpm", "dev"]

# -----------------------------------------------------------------------------
# Runner stage: Lightweight production image
# -----------------------------------------------------------------------------
FROM node:22.14.0-alpine3.21 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create app directory with proper ownership
RUN chown -R node:node /app

# Copy production artifacts with non-root ownership
COPY --from=prod-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=prod-dependencies --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/students').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]

