# Multi-stage Dockerfile for production deployment

# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:20-alpine AS dependencies

# Install pnpm
RUN npm install -g pnpm@10

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm prisma:generate

# ===================================
# Stage 2: Builder
# ===================================
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10

WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source files
COPY . .

# Build application
RUN pnpm build

# ===================================
# Stage 3: Production
# ===================================
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm@10

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies and built files
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
