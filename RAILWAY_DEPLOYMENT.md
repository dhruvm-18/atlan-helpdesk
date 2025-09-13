# Railway Deployment Guide

This guide will help you deploy the AI Helpdesk Demo to Railway using Docker.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. Your project code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### Method 1: Deploy from GitHub (Recommended)

1. **Connect Repository**
   - Go to [railway.app](https://railway.app) and sign in
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Environment Variables**
   Set these environment variables in Railway:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   FLASK_ENV=production
   PORT=8080
   CORS_ORIGIN=*
   ```

3. **Deploy**
   - Railway will automatically detect the Dockerfile
   - The build process will take 5-10 minutes
   - Your app will be available at the generated Railway URL

### Method 2: Deploy using Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set GEMINI_API_KEY=your_api_key_here
   railway variables set FLASK_ENV=production
   railway variables set PORT=8080
   railway variables set CORS_ORIGIN=*
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `FLASK_ENV` | Set to `production` | Yes |
| `PORT` | Port number (Railway sets this automatically) | No |
| `CORS_ORIGIN` | CORS origin (use `*` for Railway) | No |

## Troubleshooting

### Build Issues
- Ensure your repository includes all necessary files
- Check that the Dockerfile is in the root directory
- Verify that requirements.txt and package.json are present

### Runtime Issues
- Check Railway logs for error messages
- Ensure environment variables are set correctly
- Verify the health check endpoint `/api/health` is responding

### Performance
- The app includes a health check that may take up to 60 seconds on first startup
- Knowledge base initialization happens in the background
- Consider upgrading to a higher Railway plan for better performance

## Local Testing with Docker

Before deploying, test locally:

```bash
# Build the image
docker build -t ai-helpdesk .

# Run the container
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key_here ai-helpdesk

# Or use docker-compose
docker-compose up
```

## Post-Deployment

1. Visit your Railway app URL
2. Check `/api/health` endpoint for API status
3. Check `/api/kb/status` for knowledge base status
4. Test the frontend interface

Your AI Helpdesk should now be live on Railway! 🚀