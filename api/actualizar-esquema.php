<?php
/*
Actualiza columnas que necesita la API.
Se ejecuta desde PowerShell, no desde el navegador.
No elimina usuarios, comercios ni productos.
*/
if (PHP_SAPI !== "cli") {
    http_response_code(403);
    exit;
}

require_once __DIR__ . "/conexion.php";

function agregarColumnaSiFalta($conexion, $tabla, $columna, $definicion) {
    $consulta = $conexion->query(
        "SHOW COLUMNS FROM `$tabla` LIKE '$columna'"
    );

    if (!$consulta->fetch(PDO::FETCH_ASSOC)) {
        $conexion->exec(
            "ALTER TABLE `$tabla` ADD COLUMN $definicion"
        );
        echo "Columna $tabla.$columna agregada.\n";
    }
}

try {
    agregarColumnaSiFalta(
        $conexion,
        "promocion",
        "nombre",
        "nombre VARCHAR(100) NOT NULL DEFAULT 'Promocion' AFTER id_producto"
    );

    agregarColumnaSiFalta(
        $conexion,
        "pedido",
        "observacion",
        "observacion VARCHAR(255) NULL AFTER estado"
    );

    echo "Estructura de MySQL actualizada correctamente.\n";
} catch (PDOException $e) {
    fwrite(STDERR, "No se pudo actualizar la base de datos.\n");
    exit(1);
}
