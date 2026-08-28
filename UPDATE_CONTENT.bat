@echo off
cd /d "%~dp0"
echo Updating birthday website content...
echo.
where py >nul 2>nul
if %errorlevel%==0 (
    py generate_content.py
) else (
    python generate_content.py
)
echo.
pause
