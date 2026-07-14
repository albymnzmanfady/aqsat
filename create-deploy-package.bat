@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    Creating Deployment Package...
echo ========================================
echo.

set "TEMP_DIR=%TEMP%\aqsat_deploy_%RANDOM%"
set "DEPLOY_DIR=%TEMP_DIR%\aqsat"
set "ARCHIVE_NAME=aqsat-deploy.zip"

if exist "%ARCHIVE_NAME%" del "%ARCHIVE_NAME%"

mkdir "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%\src"
mkdir "%DEPLOY_DIR%\server"
mkdir "%DEPLOY_DIR%\public"

echo [1/5] Copying root files...

for %%f in (package.json package-lock.json Dockerfile docker-compose.yml nginx.conf deploy.sh .dockerignore index.html vite.config.ts tailwind.config.ts postcss.config.js tsconfig.json components.json vercel.json eslint.config.js tsconfig.app.json tsconfig.node.json) do (
    if exist "%%f" copy "%%f" "%DEPLOY_DIR%\" >nul 2>&1
)

echo [2/5] Copying src folder...

xcopy /E /I /Q /Y "src" "%DEPLOY_DIR%\src" >nul

echo [3/5] Copying server folder...

xcopy /E /I /Q /Y "server" "%DEPLOY_DIR%\server" >nul

echo [4/5] Copying public folder...

xcopy /E /I /Q /Y "public" "%DEPLOY_DIR%\public" >nul 2>&1

echo [5/5] Creating zip archive...

powershell -Command "Compress-Archive -Path '%DEPLOY_DIR%\*' -DestinationPath '%CD%\%ARCHIVE_NAME%' -Force"

if exist "%TEMP_DIR%" rmdir /S /Q "%TEMP_DIR%"

echo.
if exist "%ARCHIVE_NAME%" (
    echo ========================================
    echo    SUCCESS! Package created.
    echo ========================================
    echo.
    echo    File: %ARCHIVE_NAME%
    echo.
    echo    Upload to VPS:
    echo    scp %ARCHIVE_NAME% root@92.5.115.174:/root/
    echo.
    echo    On VPS run:
    echo    unzip %ARCHIVE_NAME% -d aqsat
    echo    cd aqsat
    echo    chmod +x deploy.sh
    echo    ./deploy.sh
    echo ========================================
) else (
    echo ERROR: Failed to create package.
)

echo.
pause