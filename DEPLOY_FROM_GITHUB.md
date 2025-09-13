# 🚀 Deploy from GitHub Repository

Your AI Helpdesk is now on GitHub! Here are the easiest ways to deploy it live:

## Repository: https://github.com/dhruvm-18/atlan-helpdesk

---

## 🎯 One-Click Deployments

### Option 1: Vercel (Recommended)
**⚡ Fastest deployment - 2 minutes**

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import from GitHub**: `dhruvm-18/atlan-helpdesk`
4. **Configure**:
   - Framework Preset: `Other`
   - Build Command: `cd frontend && npm install --legacy-peer-deps && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && npm install --legacy-peer-deps`
5. **Environment Variables**:
   ```
   CORS_ORIGIN=*
   FLASK_ENV=production
   ```
6. **Deploy** - Your app will be live in 2 minutes!

**Live URL**: `https://atlan-helpdesk-[random].vercel.app`

### Option 2: Railway
**🚂 Great for full-stack apps**

1. **Go to [railway.app](https://railway.app)**
2. **Click "Deploy from GitHub repo"**
3. **Connect**: `dhruvm-18/atlan-helpdesk`
4. **Railway auto-detects** the configuration
5. **Environment Variables**:
   ```
   PORT=5001
   CORS_ORIGIN=*
   FLASK_ENV=production
   ```
6. **Deploy** - Live in 3-5 minutes!

### Option 3: Render
**🎨 Free tier available**

1. **Go to [render.com](https://render.com)**
2. **Create Web Service**
3. **Connect GitHub**: `dhruvm-18/atlan-helpdesk`
4. **Configuration**:
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && gunicorn --bind 0.0.0.0:$PORT app:app`
5. **Environment Variables**:
   ```
   FLASK_ENV=production
   CORS_ORIGIN=*
   ```
6. **Deploy** - Live in 5-10 minutes!

### Option 4: Replit
**🔧 Perfect for quick demos**

1. **Go to [replit.com](https://replit.com)**
2. **Click "Create Repl"**
3. **Import from GitHub**: `https://github.com/dhruvm-18/atlan-helpdesk`
4. **Run the setup**:
   ```bash
   # In Shell tab
   cd backend && pip install -r requirements.txt
   cd ../frontend && npm install --legacy-peer-deps
   ```
5. **Start both services**:
   ```bash
   # Terminal 1
   cd backend && python app.py
   
   # Terminal 2  
   cd frontend && npm run dev
   ```
6. **Share your Repl** - Instant live demo!

---

## 🔧 Manual Deployment (Advanced)

### Using Vercel CLI
```bash
# Clone the repo
git clone https://github.com/dhruvm-18/atlan-helpdesk.git
cd atlan-helpdesk

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Using Railway CLI
```bash
# Clone the repo
git clone https://github.com/dhruvm-18/atlan-helpdesk.git
cd atlan-helpdesk

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

---

## 🌐 What You'll Get

Once deployed, your live application will feature:

### 📊 **Dashboard Tab**
- Interactive ticket table with 16 sample tickets
- Advanced filtering (topic, sentiment, priority, channel)
- Real-time charts and analytics
- Ticket details drawer with full information

### 🤖 **Agent Tab**
- AI-powered ticket classification
- RAG-based intelligent responses
- Query history and recent interactions
- Beautiful animations and micro-interactions

### ✨ **Features**
- **Responsive Design**: Works on all devices
- **Dark/Light Theme**: Persistent theme switching
- **Real-time Processing**: Instant AI classification
- **Production Ready**: Optimized for performance

---

## 🔍 Testing Your Deployment

After deployment, test these endpoints:

1. **Main App**: `https://your-app.com`
2. **Health Check**: `https://your-app.com/api/health`
3. **Knowledge Base**: `https://your-app.com/api/kb/status`
4. **Sample API**: `https://your-app.com/api/tickets`

---

## 🎯 Demo Scenarios

Try these sample tickets in your live app:

1. **Connector Issue**: "My Snowflake connector is failing to sync data"
2. **API Question**: "How do I use the Atlan REST API to get asset metadata?"
3. **SSO Problem**: "Users can't login with SAML SSO"
4. **Lineage Query**: "Why is my data lineage not showing up?"

---

## 🚀 Performance Notes

- **First Load**: May take 30-60 seconds (cold start)
- **Knowledge Base**: Initializes in background
- **Subsequent Requests**: Fast response times
- **Free Tiers**: Perfect for demos and evaluation

---

## 📞 Support

If you encounter any deployment issues:

1. **Check the logs** in your deployment platform
2. **Verify environment variables** are set correctly
3. **Ensure build commands** match the platform requirements
4. **Test locally first** with the provided scripts

---

**🎉 Your AI Helpdesk will be live and ready for evaluation in minutes!**

Choose your preferred platform above and follow the steps. The application showcases enterprise-grade AI capabilities with a beautiful, responsive interface.