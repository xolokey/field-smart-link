#!/bin/bash

# Field Smart Link Deployment Script
echo "🌾 Field Smart Link - Deployment Script"
echo "========================================"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set environment variables
echo "🔧 Setting up environment variables..."

echo "Setting VITE_SUPABASE_URL..."
vercel env add VITE_SUPABASE_URL production preview development

echo "Setting VITE_SUPABASE_ANON_KEY..."
vercel env add VITE_SUPABASE_ANON_KEY production preview development

echo "Setting GEMINI_API_KEY..."
vercel env add GEMINI_API_KEY production preview development

echo "Setting feature flags..."
vercel env add VITE_ENABLE_ANALYTICS production preview development
vercel env add VITE_ENABLE_PWA production preview development
vercel env add VITE_ENABLE_OFFLINE production preview development
vercel env add VITE_ENABLE_VOICE production preview development
vercel env add VITE_ENABLE_MONITORING production preview development

echo "Setting production configuration..."
vercel env add VITE_DEBUG production preview development

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your application should now be live!"