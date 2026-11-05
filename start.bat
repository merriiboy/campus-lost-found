@echo off
title Campus Lost and Found Server
cd /d "%~dp0"
echo Starting Campus Lost and Found on http://localhost:3001 ...
node server.js
pause
