@echo off
echo ===================================================
echo Running CareTrail Test Suite (Maven Surefire)...
echo ===================================================
cd /d "%~dp0backend"
call mvnw.cmd test
pause
