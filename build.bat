@echo off
echo 🔨 Building AI Helpdesk Application...

REM Install backend dependencies
echo 📦 Installing Python dependencies...
cd backend
pip install -r requirements.txt

REM Initialize knowledge base
echo 🧠 Initializing knowledge base...
python init_kb.py

REM Go back to root
cd ..

REM Install frontend dependencies
echo 📦 Installing Node.js dependencies...
cd frontend
npm install --legacy-peer-deps

REM Build frontend
echo 🏗️ Building frontend...
npm run build

echo ✅ Build complete!
echo 🚀 Ready for deployment!
pause