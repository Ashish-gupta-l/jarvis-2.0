@echo off
set "MAVEN_EXEC=%~dp0..\tools\maven\apache-maven-3.9.9\bin\mvn.cmd"
if not exist "%MAVEN_EXEC%" (
    set "MAVEN_EXEC=%~dp0tools\maven\apache-maven-3.9.9\bin\mvn.cmd"
)
if exist "%MAVEN_EXEC%" (
    call "%MAVEN_EXEC%" %*
) else (
    call mvn %*
)
