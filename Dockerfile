# Stage 1: Build frontend
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm config set onlyBuiltDependencies @swc/core esbuild --location project && pnpm install --ignore-scripts
RUN pnpm install
COPY . .
RUN npx vite build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && node -e "const p=require('./package.json');p.pnpm={onlyBuiltDependencies:['better-sqlite3','core-js','esbuild','@swc/core','inotify']};require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))" && pnpm install --prod

COPY server ./server
COPY --from=build /app/dist ./dist
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npx", "--yes", "tsx", "server/index.ts"]
