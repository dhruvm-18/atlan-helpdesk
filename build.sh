#!/bin/bash

echo "🔨 Building AI Helpdesk Application..."

# Install backend dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Initialize knowledge base
echo "🧠 Initializing knowledge base..."
python init_kb.py

# Go back to root
cd ..

# Install frontend dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install --legacy-peer-deps

# Build frontend
echo "🏗️ Building frontend..."
npm run build

echo "✅ Build complete!"
echo "🚀 Ready for deployment!"