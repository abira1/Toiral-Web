@echo off
echo ===================================
echo Setting Environment Variables
echo ===================================
echo.

echo Loading environment variables from .env.production...

REM Parse .env.production file and set environment variables
for /F "tokens=*" %%A in (.env.production) do (
    set %%A
)

echo Environment variables set successfully!
echo.
echo You can now run 'deploy-to-firebase.bat' to deploy with these variables.
echo ===================================
