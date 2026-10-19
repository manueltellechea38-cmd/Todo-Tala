$ErrorActionPreference = "Stop"

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Host "No se encontro PHP en el PATH." -ForegroundColor Red
    exit 1
}

$conexion = Join-Path $PSScriptRoot "conexion.php"

if (-not (Test-Path $conexion)) {
    Write-Host "Falta api\conexion.php." -ForegroundColor Red
    Write-Host "Ejecuta primero:"
    Write-Host "powershell -ExecutionPolicy Bypass -File .\api\preparar-entorno.ps1"
    exit 1
}

Write-Host "API Todo Tala iniciada en http://localhost:3000" -ForegroundColor Green
Write-Host "Deja esta ventana abierta mientras uses Postman."
Write-Host ""

php -S localhost:3000 -t $PSScriptRoot
