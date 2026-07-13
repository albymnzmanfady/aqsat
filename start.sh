#!/bin/bash
echo "🚀 Starting development servers..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start both servers
echo "⚡ Starting backend and frontend..."
npx concurrently "npx tsx watch server/index.ts" "npx vite --host"