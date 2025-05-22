@echo off
echo ===================================
echo Firebase Deployment Script
echo ===================================
echo.

echo Setting up environment variables...
set NODE_ENV=production

echo Building project...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo Error: Build failed!
  exit /b %ERRORLEVEL%
)
echo Build completed successfully!
echo.

echo Setting Firebase environment variables...
call firebase functions:config:set firebase.apikey=%VITE_FIREBASE_API_KEY% ^
  firebase.authdomain=%VITE_FIREBASE_AUTH_DOMAIN% ^
  firebase.databaseurl=%VITE_FIREBASE_DATABASE_URL% ^
  firebase.projectid=%VITE_FIREBASE_PROJECT_ID% ^
  firebase.storagebucket=%VITE_FIREBASE_STORAGE_BUCKET% ^
  firebase.messagingsenderid=%VITE_FIREBASE_MESSAGING_SENDER_ID% ^
  firebase.appid=%VITE_FIREBASE_APP_ID% ^
  firebase.measurementid=%VITE_FIREBASE_MEASUREMENT_ID% ^
  admin.email=%VITE_ADMIN_EMAIL%

echo Deploying to Firebase...
call firebase deploy
if %ERRORLEVEL% neq 0 (
  echo Error: Deployment failed!
  exit /b %ERRORLEVEL%
)
echo.
echo ===================================
echo Deployment completed successfully!
echo Your site is now live at: https://toiral-development.web.app
echo ===================================
