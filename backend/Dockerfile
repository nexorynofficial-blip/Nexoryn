# Nexoryn backend — production image.
#
# Multi-stage so the runtime layer carries only what it needs: compiled JS,
# production node_modules, and the generated Prisma client. The TypeScript
# sources and dev dependencies stay in the builder.

# ── Builder ──────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

# Prisma's engines need OpenSSL; the slim image doesn't ship it.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# Full install (dev deps included) — the builder needs TypeScript and the
# Prisma CLI. This repo is developed with bun, so only bun.lock is committed
# and there is no package-lock.json for `npm ci`; commit one if you want the
# stricter, fully reproducible path.
RUN npm ci 2>/dev/null || npm install

# Generate the client before compiling — src imports @prisma/client types.
COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Reinstall without dev dependencies, then regenerate the client into the
# pruned tree so the runtime stage can copy node_modules wholesale.
RUN npm prune --omit=dev && npx prisma generate

# ── Runtime ──────────────────────────────────────────────────────────────
FROM node:22-slim AS runtime

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Don't run as root.
USER node

EXPOSE 3001

# Apply any pending migrations before serving. Safe to run on every boot —
# `migrate deploy` only applies what hasn't been applied yet, and it never
# generates or resets anything the way `migrate dev` does.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
