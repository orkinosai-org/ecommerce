#!/bin/bash
set -e

echo "🧪 Running tests for E-Commerce Platform..."

# Test shared package
echo "📦 Testing shared package..."
cd shared && npm run type-check && cd ..

# Test backend
echo "🔧 Testing backend..."
cd backend && npm run type-check && npm test && cd ..

# Test frontend
echo "🎨 Testing frontend..."
cd frontend && npm run type-check && npm test -- --watchAll=false && cd ..

echo "✅ All tests passed!"