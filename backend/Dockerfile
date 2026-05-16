# ── Build stage ──────────────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Install system deps for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# ── Production stage ──────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

# Copy from base
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app .

# Create logs dir
RUN mkdir -p logs

# Non-root user for security
RUN addgroup -S payro && adduser -S payro -G payro
RUN chown -R payro:payro /app
USER payro

EXPOSE 4000

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/app.js"]
