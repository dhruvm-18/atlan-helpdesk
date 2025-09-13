# 🚀 Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)
**Best for**: Quick deployment with serverless backend

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Configure Environment**:
   - Set `CORS_ORIGIN` to your Vercel domain
   - The app will be live at `https://your-app.vercel.app`

### Option 2: Railway
**Best for**: Full-stack apps with persistent storage

1. **Connect GitHub**: Push your code to GitHub
2. **Deploy on Railway**: 
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repo
   - Railway will auto-detect and deploy both frontend and backend
3. **Environment Variables**:
   ```
   PORT=5001
   CORS_ORIGIN=*
   FLASK_ENV=production
   ```

### Option 3: Render
**Best for**: Free tier with good performance

1. **Backend Service**:
   - Create new Web Service on [render.com](https://render.com)
   - Connect your GitHub repo
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && gunicorn --bind 0.0.0.0:$PORT app:app`

2. **Frontend Service**:
   - Create new Static Site
   - Build Command: `cd frontend && npm install --legacy-peer-deps && npm run build`
   - Publish Directory: `frontend/dist`
   - Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`

### Option 4: Replit
**Best for**: Quick prototyping and sharing

1. **Import Project**:
   - Go to [replit.com](https://replit.com)
   - Import from GitHub
   - Replit will auto-detect the project structure

2. **Run Configuration**:
   ```bash
   # In the Shell tab
   cd backend && pip install -r requirements.txt
   cd ../frontend && npm install --legacy-peer-deps
   
   # Start both services
   cd backend && python app.py &
   cd frontend && npm run dev
   ```

### Option 5: Streamlit Community Cloud
**Best for**: Data science focused deployment

1. **Create Streamlit Version** (if needed):
   ```python
   # streamlit_app.py
   import streamlit as st
   import requests
   
   st.title("🤖 AI Helpdesk Demo")
   
   # Your Streamlit interface here
   ```

2. **Deploy**: Connect GitHub repo at [share.streamlit.io](https://share.streamlit.io)

## Environment Variables

### Backend (.env)
```bash
FLASK_ENV=production
PORT=5001
CORS_ORIGIN=*
USE_ONLINE_RAG=false
```

### Frontend
```bash
VITE_API_URL=https://your-backend-url.com
```

## Build Commands

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run build
```

### Backend
```bash
cd backend
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:$PORT app:app
```

## Testing Your Deployment

1. **Health Check**: Visit `https://your-app.com/api/health`
2. **Knowledge Base**: Visit `https://your-app.com/api/kb/status`
3. **Frontend**: Visit `https://your-app.com`

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Update `CORS_ORIGIN` in backend environment
2. **Build Failures**: Use `--legacy-peer-deps` for npm install
3. **API Connection**: Check `VITE_API_URL` in frontend environment
4. **Knowledge Base**: May take 30-60 seconds to initialize on first load

### Performance Tips:

- **Cold Starts**: First request may be slow (30s) on free tiers
- **Knowledge Base**: Initializes in background, check `/api/kb/status`
- **Caching**: Enable Redis for production (optional)

## Production Optimizations

1. **Add Redis Caching**:
   ```bash
   pip install redis
   ```

2. **Database Migration**:
   - Replace JSON files with PostgreSQL/MongoDB
   - Add connection pooling

3. **CDN Setup**:
   - Serve static assets from CDN
   - Enable gzip compression

4. **Monitoring**:
   - Add application monitoring (Sentry, DataDog)
   - Set up health checks and alerts

## Security Checklist

- ✅ CORS properly configured
- ✅ Input validation with Pydantic
- ✅ Error handling without sensitive data exposure
- ✅ Rate limiting (add for production)
- ✅ HTTPS enabled (automatic on most platforms)

---

**Your AI Helpdesk is now ready for the world! 🌍**

Choose the deployment option that best fits your needs and follow the steps above. The application will be live and accessible to users within minutes.