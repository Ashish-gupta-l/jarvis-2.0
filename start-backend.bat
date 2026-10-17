@echo off
echo ===================================================
echo Starting CareTrail Backend (Spring Boot 3.3.4)...
echo ===================================================
cd /d "%~dp0backend"
call mvnw.cmd spring-boot:run
pause
