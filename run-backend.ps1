# Launch Java Spring Boot Backend REST Application
Write-Host "Starting Spring Boot Backend Server on http://localhost:8080..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot/backend"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\run.ps1
