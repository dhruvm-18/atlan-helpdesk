# Installation Guide

## Quick Start (Recommended)

### Option 1: Using the Batch Files (Windows)
1. **Start Backend**: Double-click `start-backend.bat`
2. **Start Frontend**: Double-click `start-frontend.bat` 
3. **Open Browser**: Navigate to `http://localhost:5173`

### Option 2: Manual Installation

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Frontend Setup
```bash
cd frontend

# Clean install (recommended)
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Or if you encounter issues, try:
npm install --force

# Start development server
npm run dev
```

## Troubleshooting

### Frontend Dependency Issues
If you encounter ESLint/TypeScript version conflicts:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Alternative: Use Yarn
```bash
cd frontend
yarn install
yarn dev
```

### Backend Issues
If you encounter Python package issues:
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

## System Requirements
- **Node.js**: 16+ (18+ recommended)
- **Python**: 3.8+ (3.11+ recommended)
- **npm**: 8+ or **yarn**: 1.22+
- **pip**: 21+

## Verification
Once both servers are running:
- Backend: `http://localhost:5001/api/health` should return `{"status": "ok"}`
- Frontend: `http://localhost:5173` should show the dashboard

## Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend (using gunicorn)
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```