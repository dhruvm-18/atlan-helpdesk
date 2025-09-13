@echo off
echo 🚀 AI Helpdesk Deployment Script
echo =================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo 📝 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit: AI Helpdesk Demo"
)

echo.
echo Choose your deployment platform:
echo 1^) Vercel ^(Recommended - Serverless^)
echo 2^) Railway ^(Full-stack with database^)
echo 3^) Render ^(Free tier available^)
echo 4^) Manual GitHub setup
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo 🔧 Setting up Vercel deployment...
    where vercel >nul 2>nul
    if errorlevel 1 (
        echo Installing Vercel CLI...
        npm install -g vercel
    )
    echo 🚀 Deploying to Vercel...
    vercel --prod
) else if "%choice%"=="2" (
    echo 🔧 Setting up Railway deployment...
    echo 1. Push your code to GitHub
    echo 2. Go to https://railway.app
    echo 3. Connect your GitHub repository
    echo 4. Railway will auto-deploy your app
    echo.
    echo 📋 Environment variables to set in Railway:
    echo    PORT=5001
    echo    CORS_ORIGIN=*
    echo    FLASK_ENV=production
) else if "%choice%"=="3" (
    echo 🔧 Setting up Render deployment...
    echo 1. Push your code to GitHub
    echo 2. Go to https://render.com
    echo 3. Create a new Web Service
    echo 4. Connect your GitHub repository
    echo.
    echo 📋 Render configuration:
    echo    Build Command: cd backend ^&^& pip install -r requirements.txt
    echo    Start Command: cd backend ^&^& gunicorn --bind 0.0.0.0:$PORT app:app
) else if "%choice%"=="4" (
    echo 📝 Setting up GitHub repository...
    echo 1. Create a new repository on GitHub
    echo 2. Add the remote origin:
    echo    git remote add origin https://github.com/yourusername/your-repo.git
    echo 3. Push your code:
    echo    git push -u origin main
    echo.
    echo Then choose any deployment platform that supports GitHub integration.
) else (
    echo ❌ Invalid choice. Please run the script again.
    exit /b 1
)

echo.
echo ✅ Deployment setup complete!
echo.
echo 📚 For detailed instructions, see DEPLOYMENT.md
echo 🔍 Test your deployment:
echo    - Health check: https://your-app.com/api/health
echo    - Knowledge base: https://your-app.com/api/kb/status
echo    - Frontend: https://your-app.com
echo.
echo 🎉 Your AI Helpdesk is ready to go live!

pause