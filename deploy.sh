#!/bin/bash

# Expenses App - Quick Deployment Script
# This script helps you quickly deploy the app using different methods

set -e

echo "🚀 Expenses App - Deployment Helper"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one..."
    echo "DATABASE_URL=postgresql://user:password@host/database" > .env
    echo "SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env
    echo "NODE_ENV=production" >> .env
    echo "✅ Created .env file. Please update DATABASE_URL with your actual database credentials."
    echo ""
fi

echo "Choose deployment method:"
echo "1) Test with Docker locally"
echo "2) Deploy to Railway"
echo "3) Deploy to Vercel"
echo "4) Build for manual deployment"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🐳 Building and running with Docker..."
        echo ""
        
        # Build the Docker image
        docker build -t expenses-app .
        
        # Run the container
        echo "Starting container on port 5000..."
        docker run -d -p 5000:5000 --env-file .env --name expenses-app expenses-app
        
        echo ""
        echo "✅ Container started!"
        echo "📍 Access your app at: http://localhost:5000"
        echo ""
        echo "Useful commands:"
        echo "  docker logs expenses-app -f    # View logs"
        echo "  docker stop expenses-app       # Stop container"
        echo "  docker rm expenses-app         # Remove container"
        ;;
        
    2)
        echo ""
        echo "🚂 Deploying to Railway..."
        echo ""
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo "Railway CLI not found. Installing..."
            npm install -g @railway/cli
        fi
        
        # Build first
        echo "Building application..."
        yarn build
        
        # Initialize Railway project if needed
        if [ ! -f railway.json ]; then
            echo "Initializing Railway project..."
            railway init
        fi
        
        # Deploy
        echo "Deploying to Railway..."
        railway up
        
        echo ""
        echo "✅ Deployed to Railway!"
        echo "Don't forget to set your environment variables in Railway dashboard:"
        echo "  railway variables set DATABASE_URL='your_postgres_url'"
        echo "  railway variables set SESSION_SECRET='your_secret'"
        ;;
        
    3)
        echo ""
        echo "☁️  Deploying to Vercel..."
        echo ""
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi
        
        # Build first
        echo "Building application..."
        yarn build
        
        # Deploy
        echo "Deploying to Vercel..."
        vercel --prod
        
        echo ""
        echo "✅ Deployed to Vercel!"
        echo "Remember to set environment variables in Vercel dashboard"
        ;;
        
    4)
        echo ""
        echo "🔨 Building for manual deployment..."
        echo ""
        
        # Build the application
        yarn build
        
        echo ""
        echo "✅ Build complete!"
        echo "📦 Built files are in: ./dist"
        echo ""
        echo "To run in production:"
        echo "  NODE_ENV=production node dist/index.cjs"
        ;;
        
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📚 For more detailed instructions, see DEPLOYMENT.md"

