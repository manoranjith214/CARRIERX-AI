
$ErrorActionPreference = "Stop"
Write-Host "Starting CareerX AI backend..."
Set-Location "$PSScriptRoot\CareerX-AI-Backend"
if (!(Test-Path ".venv")) { python -m venv .venv }
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt
if (!(Test-Path ".env")) { Copy-Item .env.example .env }
Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$PWD'; .\.venv\Scripts\python.exe run.py"

Write-Host "Starting CareerX AI frontend..."
Set-Location "$PSScriptRoot\CareerX-AI-Frontend"
npm install
npm run dev
