# ============ Stage 1: Build ============
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies (including dev for build)
RUN npm install

# Copy source code
COPY . .

# Build the frontend with Vite
RUN npm run build

# ============ Stage 2: Production ============
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy server files
COPY server ./server

# Copy any needed config files
COPY tsconfig.json ./
COPY tsconfig.node.json ./

# Create data directory for any local storage
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/users || exit 1

# Start the server
CMD ["node", "--import", "tsx", "server/index.ts"]