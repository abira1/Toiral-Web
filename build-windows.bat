@echo off
echo ===================================
echo Building for Windows Environment
echo ===================================
echo.

echo Setting environment variables...
set NODE_ENV=production

echo Generating Firebase service worker...
node scripts/generate-firebase-sw.js

echo Building project...
npx vite build

echo ===================================
echo Build completed!
echo ===================================
