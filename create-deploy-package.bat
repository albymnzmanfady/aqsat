@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════╗
echo ║   📦 إنشاء حزمة النشر              ║
echo ╚════════════════════════════════════════╝
echo.

:: Create temp directory
set "TEMP_DIR=%TEMP%\aqsat_deploy_%RANDOM%"
set "DEPLOY_DIR=%TEMP_DIR%\aqsat"
set "ARCHIVE_NAME=aqsat-deploy.zip"

mkdir "%DEPLOY_DIR%"

echo 🔨 جاري نسخ الملفات...

:: Root config files
copy package.json "%DEPLOY_DIR%" >nul 2>&1
copy package-lock.json "%DEPLOY_DIR%" >nul 2>&1
copy Dockerfile "%DEPLOY_DIR%" >nul 2>&1
copy docker-compose.yml "%DEPLOY_DIR%" >nul 2>&1
copy nginx.conf "%DEPLOY_DIR%" >nul 2>&1
copy deploy.sh "%DEPLOY_DIR%" >nul 2>&1
copy .dockerignore "%DEPLOY_DIR%" >nul 2>&1
copy index.html "%DEPLOY_DIR%" >nul 2>&1
copy vite.config.ts "%DEPLOY_DIR%" >nul 2>&1
copy tailwind.config.ts "%DEPLOY_DIR%" >nul 2>&1
copy postcss.config.js "%DEPLOY_DIR%" >nul 2>&1
copy tsconfig.json "%DEPLOY_DIR%" >nul 2>&1
copy tsconfig.app.json "%DEPLOY_DIR%" >nul 2>&1
copy tsconfig.node.json "%DEPLOY_DIR%" >nul 2>&1
copy components.json "%DEPLOY_DIR%" >nul 2>&1
copy vercel.json "%DEPLOY_DIR%" >nul 2>&1
copy eslint.config.js "%DEPLOY_DIR%" >nul 2>&1

echo 📁 نسخ المجلدات...

:: Copy src directory
xcopy /E /I /Q /Y "src" "%DEPLOY_DIR%\src" >nul

:: Copy server directory
xcopy /E /I /Q /Y "server" "%DEPLOY_DIR%\server" >nul

:: Copy public directory
if exist "public" (
    xcopy /E /I /Q /Y "public" "%DEPLOY_DIR%\public" >nul
)

:: Remove node_modules if copied by mistake
if exist "%DEPLOY_DIR%\node_modules" (
    rmdir /S /Q "%DEPLOY_DIR%\node_modules"
)

:: Remove .git if copied
if exist "%DEPLOY_DIR%\.git" (
    rmdir /S /Q "%DEPLOY_DIR%\.git"
)

echo 📦 جاري إنشاء الملف المضغوط...

:: Remove old archive if exists
if exist "%ARCHIVE_NAME%" del "%ARCHIVE_NAME%"

:: Create zip using PowerShell
powershell -Command "Compress-Archive -Path '%DEPLOY_DIR%' -DestinationPath '%CD%\%ARCHIVE_NAME%' -Force"

:: Cleanup temp
rmdir /S /Q "%TEMP_DIR%" 2>nul

:: Get file size
for %%A in ("%ARCHIVE_NAME%") do set "SIZE=%%~zA"

:: Convert size to human readable
set /a "SIZE_MB=%SIZE% / 1048576"

echo.
echo ✅ تم إنشاء الحزمة بنجاح!
echo.
echo 📦 الحزمة: %ARCHIVE_NAME% (%SIZE_MB% MB)
echo 📁 الموقع: %CD%\%ARCHIVE_NAME%
echo.
echo ────────────────────────────────────────
echo  خطوات الرفع على VPS:
echo ────────────────────────────────────────
echo.
echo  1. ارفع الحزمة:
echo     scp %ARCHIVE_NAME% root@92.5.115.174:/root/
echo.
echo  2. دخل على VPS:
echo     ssh root@92.5.115.174
echo.
echo  3. فك الحزمة وشغّل:
echo     apt-get install -y unzip
echo     unzip aqsat-deploy.zip -d aqsat
echo     cd aqsat
echo     chmod +x deploy.sh
echo     ./deploy.sh
echo ────────────────────────────────────────
echo.

pause