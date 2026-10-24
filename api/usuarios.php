<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

/*
Para consultar usuarios es obligatorio iniciar sesion.
*/
$usuarioActual = requerirLogin($conexion);

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    responder(405, [
        "error" => "Metodo no permitido"
    ]);
}

/*
Si se envia un id, solamente se puede consultar
el propio usuario.
*/
if (isset($_GET["id"])) {

    $id = intval($_GET["id"]);

    if ((int) $usuarioActual["id_persona"] !== $id) {
        responder(403, [
            "error" => "No tenes permisos para consultar ese usuario"
        ]);
    }
}

/*
Devuelve solamente los datos de la cuenta autenticada.
*/
$sql = "SELECT
            id_persona,
            nombre,
            cedula,
            correo,
            rol,
            fecha_nacimiento,
            fecha_registro,
            activo
        FROM usuario
        WHERE id_persona = ?";

$consulta = $conexion->prepare($sql);

$consulta->execute([
    $usuarioActual["id_persona"]
]);

$usuario = $consulta->fetch(PDO::FETCH_ASSOC);

if (!$usuario) {
    responder(404, [
        "error" => "Usuario no encontrado"
    ]);
}

responder(200, $usuario);