$ErrorActionPreference = "Continue"

$endpoints = @(
    "productos.php",
    "usuarios.php",
    "comercios.php",
    "empleados.php",
    "promociones.php",
    "pedidos.php"
)

foreach ($endpoint in $endpoints) {
    $url = "http://localhost:3000/$endpoint"

    try {
        Invoke-RestMethod $url | Out-Null
        Write-Host "[OK] $endpoint" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] $endpoint - $($_.Exception.Message)" -ForegroundColor Red
    }
}
