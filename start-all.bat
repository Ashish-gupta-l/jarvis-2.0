@echo off
echo ===================================================
echo Starting CareTrail Full Stack Application...
echo ===================================================
echo [1/2] Launching Backend on http://localhost:8080 ...
start "CareTrail Backend (Spring Boot)" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

echo Waiting 6 seconds for backend initialization...
timeout /t 6 /nobreak > nul

echo [2/2] Launching Frontend on http://localhost:3000 ...
start "CareTrail Frontend (React Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo ===================================================
echo CareTrail is launching!
echo App URL: http://localhost:3000
echo ===================================================
timeout /t 3 /nobreak > nul
start http://localhost:3000
