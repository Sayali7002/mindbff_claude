#!/bin/bash

# 🚀 MindBFF Deployment Script
# This script helps you deploy your MindBFF app to production

set -e

echo "🎉 Welcome to MindBFF Deployment!"
echo "=================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your environment variables first."
    exit 1
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Ask for deployment platform
echo ""
echo "🌐 Choose your deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Railway"
echo "4) Self-hosted (VPS)"
echo "5) Just run migrations locally"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod
        ;;
    3)
        echo "🚀 Deploying to Railway..."
        echo "Please connect your repository to Railway and deploy manually."
        echo "Make sure to add your environment variables in Railway dashboard."
        ;;
    4)
        echo "🚀 Self-hosted deployment..."
        echo "Please follow the manual deployment steps in DEPLOYMENT_GUIDE.md"
        echo "For VPS deployment, you'll need to:"
        echo "1. Set up your server"
        echo "2. Install Node.js and PM2"
        echo "3. Clone your repository"
        echo "4. Run: npm install && npm run build"
        echo "5. Start with PM2: pm2 start npm --name 'mindbff' -- start"
        ;;
    5)
        echo "🔄 Running migrations locally..."
        echo "Starting development server..."
        npm run dev &
        SERVER_PID=$!
        
        echo "Waiting for server to start..."
        sleep 5
        
        echo "Running migration check..."
        curl -X GET http://localhost:3000/api/peer-support/encrypt-messages
        
        echo ""
        echo "✅ Migration check complete!"
        echo "Visit http://localhost:3000/admin/encryption for admin interface"
        
        # Keep server running
        echo "Server is running on http://localhost:3000"
        echo "Press Ctrl+C to stop the server"
        wait $SERVER_PID
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your deployed app"
echo "2. Run encryption migration via admin interface"
echo "3. Test all features"
echo "4. Set up monitoring"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md" 