# Stage 1: Build the frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy server code and built frontend
COPY server ./server
COPY --from=build /app/dist ./dist

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "--import", "tsx", "server/index.ts"]