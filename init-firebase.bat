@echo off
echo ===================================
echo Firebase Initialization Script
echo ===================================
echo.

echo Checking if Firebase CLI is installed...
call firebase --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Firebase CLI not found. Installing...
  call npm install -g firebase-tools
  if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install Firebase CLI!
    exit /b %ERRORLEVEL%
  )
  echo Firebase CLI installed successfully!
) else (
  echo Firebase CLI is already installed.
)
echo.

echo Logging in to Firebase...
call firebase login
if %ERRORLEVEL% neq 0 (
  echo Error: Failed to log in to Firebase!
  exit /b %ERRORLEVEL%
)
echo.

echo Initializing Firebase...
call firebase init
if %ERRORLEVEL% neq 0 (
  echo Error: Firebase initialization failed!
  exit /b %ERRORLEVEL%
)
echo.

echo ===================================
echo Firebase initialization completed!
echo ===================================
echo.
echo Next steps:
echo 1. Update your Firebase configuration in src/firebase/config.ts
echo 2. Update database security rules in database.rules.json
echo 3. Run 'npm run dev' to start the development server
echo 4. Run 'deploy-to-firebase.bat' to deploy to Firebase Hosting
echo ===================================
