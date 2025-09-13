#!/bin/bash

echo "🚀 AI Helpdesk Deployment Script"
echo "================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: AI Helpdesk Demo"
fi

echo ""
echo "Choose your deployment platform:"
echo "1) Vercel (Recommended - Serverless)"
echo "2) Railway (Full-stack with database)"
echo "3) Render (Free tier available)"
echo "4) Manual GitHub setup"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🔧 Setting up Vercel deployment..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        ;;
    2)
        echo "🔧 Setting up Railway deployment..."
        echo "1. Push your code to GitHub"
        echo "2. Go to https://railway.app"
        echo "3. Connect your GitHub repository"
        echo "4. Railway will auto-deploy your app"
        echo ""
        echo "📋 Environment variables to set in Railway:"
        echo "   PORT=5001"
        echo "   CORS_ORIGIN=*"
        echo "   FLASK_ENV=production"
        ;;
    3)
        echo "🔧 Setting up Render deployment..."
        echo "1. Push your code to GitHub"
        echo "2. Go to https://render.com"
        echo "3. Create a new Web Service"
        echo "4. Connect your GitHub repository"
        echo ""
        echo "📋 Render configuration:"
        echo "   Build Command: cd backend && pip install -r requirements.txt"
        echo "   Start Command: cd backend && gunicorn --bind 0.0.0.0:\$PORT app:app"
        ;;
    4)
        echo "📝 Setting up GitHub repository..."
        echo "1. Create a new repository on GitHub"
        echo "2. Add the remote origin:"
        echo "   git remote add origin https://github.com/yourusername/your-repo.git"
        echo "3. Push your code:"
        echo "   git push -u origin main"
        echo ""
        echo "Then choose any deployment platform that supports GitHub integration."
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment setup complete!"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo "🔍 Test your deployment:"
echo "   - Health check: https://your-app.com/api/health"
echo "   - Knowledge base: https://your-app.com/api/kb/status"
echo "   - Frontend: https://your-app.com"
echo ""
echo "🎉 Your AI Helpdesk is ready to go live!"