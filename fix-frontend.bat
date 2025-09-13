@echo off
echo Fixing frontend dependencies...
cd frontend
echo Cleaning node_modules...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo Installing dependencies with legacy peer deps...
npm install --legacy-peer-deps
echo Done! Now run start-frontend.bat
pause