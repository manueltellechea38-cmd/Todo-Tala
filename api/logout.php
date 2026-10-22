<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(405, [
        "error" => "Método no permitido"
    ]);
}

try {

    requerirLogin($conexion);

    $sql = "DELETE FROM sesiones
            WHERE token_hash = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        hashToken(obtenerToken())
    ]);

    responder(200, [
        "mensaje" => "Sesión cerrada"
    ]);

} catch (PDOException $e) {

    responder(500, [
        "error" => "Error interno del servidor"
    ]);
}