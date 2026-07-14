# Stage 1: Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN ls -la /app/src/ && ls /app/*.json /app/*.ts /app/*.html
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm install tsx --legacy-peer-deps
COPY server/ ./server/
COPY --from=builder /app/dist ./dist/
RUN mkdir -p data

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "--import", "tsx", "server/index.ts"]
