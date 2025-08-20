#!/bin/bash
set -e

echo "🏗️ Building E-Commerce Platform..."

# Build shared package first
echo "📦 Building shared package..."
cd shared && npm run build && cd ..

# Build backend
echo "🔧 Building backend..."
cd backend && npm run build && cd ..

# Build frontend
echo "🎨 Building frontend..."
cd frontend && npm run build && cd ..

echo "✅ Build completed successfully!"