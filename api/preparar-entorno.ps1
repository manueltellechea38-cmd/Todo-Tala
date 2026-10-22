$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent
$dbFile = Join-Path $repoRoot "database\baseplataforma.sql"
$conexionFile = Join-Path $PSScriptRoot "conexion.php"

Write-Host "Preparando Todo Tala..." -ForegroundColor Cyan

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Host "No se encontro PHP en el PATH." -ForegroundColor Red
    exit 1
}

$modulos = php -m 2>$null
if (($modulos -notcontains "PDO") -or ($modulos -notcontains "pdo_mysql")) {
    Write-Host "PHP necesita tener habilitados PDO y pdo_mysql." -ForegroundColor Red
    exit 1
}

$mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
$mysql = $null

if ($mysqlCmd) {
    $mysql = $mysqlCmd.Source
}

$candidatos = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe"
)

if (-not $mysql) {
    foreach ($ruta in $candidatos) {
        if (Test-Path $ruta) {
            $mysql = $ruta
            break
        }
    }
}

if (-not $mysql) {
    Write-Host "No se encontro mysql.exe. Instala MySQL o agrega mysql al PATH." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $dbFile)) {
    Write-Host "No se encontro database\baseplataforma.sql." -ForegroundColor Red
    exit 1
}

$mysqlPass = Read-Host "Escribi la contraseña del usuario root de MySQL"
$passPHP = $mysqlPass.Replace('\', '\\').Replace("'", "\'")

$conexion = @'
<?php

$host = '127.0.0.1';
$user = 'root';
$pass = '__MYSQL_PASS__';
$db = 'baseplataforma';

try {
    $conexion = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );

    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}
?>
'@

$conexion = $conexion.Replace('__MYSQL_PASS__', $passPHP)

[System.IO.File]::WriteAllText(
    $conexionFile,
    $conexion,
    (New-Object System.Text.UTF8Encoding($false))
)

Write-Host "conexion.php creado." -ForegroundColor Green

$env:MYSQL_PWD = $mysqlPass

try {
    $comandoImportar = "`"$mysql`" --default-character-set=utf8mb4 -u root < `"$dbFile`""
    cmd /c $comandoImportar

    if ($LASTEXITCODE -ne 0) {
        throw "MySQL devolvio un error al cargar la base."
    }
}
finally {
    Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Entorno preparado correctamente." -ForegroundColor Green
Write-Host "Ahora inicia la API con:" -ForegroundColor Cyan
Write-Host "powershell -ExecutionPolicy Bypass -File .\api\iniciar-api.ps1"
