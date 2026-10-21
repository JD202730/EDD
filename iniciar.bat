@echo off
rem Inicia un servidor local y abre el entrenador en el navegador (opcional: index.html tambien funciona con doble clic).
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo No se encontro Python. Abre index.html directamente con doble clic.
  start "" "%~dp0index.html"
  exit /b
)
start "" http://localhost:8000/index.html
python -m http.server 8000
