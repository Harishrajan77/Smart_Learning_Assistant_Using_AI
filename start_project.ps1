$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"
$venvPython = Join-Path $backendPath "venv\Scripts\python.exe"
$uvicornExe = Join-Path $backendPath "venv\Scripts\uvicorn.exe"

if (-not (Test-Path $venvPython) -or -not (Test-Path $uvicornExe)) {
    Write-Host "Backend virtual environment not found." -ForegroundColor Red
    Write-Host "Create it first with:" -ForegroundColor Yellow
    Write-Host "cd backend"
    Write-Host "python -m venv venv"
    Write-Host ".\venv\Scripts\activate"
    Write-Host "pip install -r requirements.txt"
    exit 1
}

if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    Write-Host "Frontend dependencies are not installed." -ForegroundColor Red
    Write-Host "Run this first:" -ForegroundColor Yellow
    Write-Host "cd frontend"
    Write-Host "npm install"
    exit 1
}

Write-Host "Starting Smart Learning Assistant..." -ForegroundColor Cyan
Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green

Start-Process powershell -WindowStyle Hidden -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; & '$venvPython' -m uvicorn main:app --reload"
Start-Sleep -Seconds 2
Start-Process powershell -WindowStyle Hidden -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev"

Write-Host "Both terminals have been opened." -ForegroundColor Cyan
