@echo off
REM Sync static site files into docs/ for GitHub Pages (no Node.js required).
REM Double-click this file or run from Command Prompt after changing index.html or public\*.

set ROOT=%~dp0
set DOCS=%ROOT%docs

if not exist "%DOCS%" mkdir "%DOCS%"

copy /Y "%ROOT%index.html" "%DOCS%index.html" >nul
copy /Y "%ROOT%public\*.html" "%DOCS%\" >nul
copy /Y "%ROOT%public\*.js" "%DOCS%\" >nul
REM Copy comprehension test HTML files from root (e.g. NAPLAN 2016 Reading Comprehension.html) so they appear on the site
for %%f in ("%ROOT%*Comprehension*.html" "%ROOT%*Reading*.html") do copy /Y "%%f" "%DOCS%\" >nul 2>nul

echo Synced index.html, public\*, and root comprehension papers to docs\
pause
