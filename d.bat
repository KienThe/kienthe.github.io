@echo off
setlocal enabledelayedexpansion

:: Set colors for Windows
set "CYAN=[36m"
set "NC=[0m"

if "%1"=="" goto help
if "%1"=="u" goto up
if "%1"=="d" goto down
if "%1"=="b" goto build
if "%1"=="p" goto prod
if "%1"=="c" goto clean
if "%1"=="l" goto logs
if "%1"=="s" goto shell
if "%1"=="db" goto db
goto help

:help
echo %CYAN%Available commands:%NC%
echo   d u [ARGS]    - Start development environment (e.g. d u --build)
echo   d d [ARGS]    - Stop containers
echo   d b [ARGS]    - Build containers
echo   d p           - Build production image
echo   d c           - Remove volumes and containers
echo   d l [ARGS]    - View container logs
echo   d s           - Access app shell
echo   d db          - Access database CLI
goto :eof

:up
echo %CYAN%Starting development environment...%NC%
docker compose up -d %2 %3 %4 %5
goto :eof

:down
echo %CYAN%Stopping containers...%NC%
docker compose down %2 %3 %4 %5
goto :eof

:build
echo %CYAN%Building containers...%NC%
docker compose build %2 %3 %4 %5
goto :eof

:prod
echo %CYAN%Building production image...%NC%
docker build --target production -t backend .
goto :eof

:clean
echo %CYAN%Cleaning up...%NC%
docker compose down -v
goto :eof

:logs
echo %CYAN%Showing logs...%NC%
docker compose logs -f %2 %3 %4 %5
goto :eof

:shell
echo %CYAN%Accessing app shell...%NC%
docker compose exec app sh
goto :eof

:db
echo %CYAN%Accessing database CLI...%NC%
docker compose exec db mysql -u%DB_USERNAME% -p%DB_PASSWORD% %DB_DATABASE%
goto :eof 