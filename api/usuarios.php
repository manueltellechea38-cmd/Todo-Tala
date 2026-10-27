<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

$usuarioActual = requerirLogin($conexion);

$metodo = $_SERVER["REQUEST_METHOD"];


/*
GET

Devuelve solamente los datos
del usuario autenticado.
*/
if ($metodo === "GET") {

    if (isset($_GET["id"])) {

        $id = intval($_GET["id"]);

        if (
            (int) $usuarioActual["id_persona"] !==
            $id
        ) {
            responder(403, [
                "error" =>
                    "No tenes permisos para consultar ese usuario"
            ]);
        }
    }

    $consulta = $conexion->prepare(
        "SELECT
            id_persona,
            nombre,
            cedula,
            correo,
            rol,
            fecha_nacimiento,
            fecha_registro,
            activo
         FROM usuario
         WHERE id_persona = ?"
    );

    $consulta->execute([
        $usuarioActual["id_persona"]
    ]);

    $usuario =
        $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        responder(404, [
            "error" => "Usuario no encontrado"
        ]);
    }

    responder(200, $usuario);
}


/*
PUT

Permite modificar los datos personales
del usuario autenticado.
*/
if ($metodo === "PUT") {

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $nombre =
        trim($datos["nombre"] ?? "");

    $correo =
        trim($datos["correo"] ?? "");

    $fechaNacimiento =
        $datos["fecha_nacimiento"] ?? null;

    if ($nombre === "") {
        responder(400, [
            "error" => "El nombre es obligatorio"
        ]);
    }

    if (
        $correo === "" ||
        !filter_var(
            $correo,
            FILTER_VALIDATE_EMAIL
        )
    ) {
        responder(400, [
            "error" => "Correo invalido"
        ]);
    }

    /*
    Verifica que el correo no pertenezca
    a otro usuario.
    */
    $consulta = $conexion->prepare(
        "SELECT id_persona
         FROM usuario
         WHERE correo = ?
           AND id_persona <> ?"
    );

    $consulta->execute([
        $correo,
        $usuarioActual["id_persona"]
    ]);

    if ($consulta->fetch(PDO::FETCH_ASSOC)) {
        responder(409, [
            "error" =>
                "Ese correo ya esta registrado"
        ]);
    }

    if ($fechaNacimiento === "") {
        $fechaNacimiento = null;
    }

    $consulta = $conexion->prepare(
        "UPDATE usuario
         SET nombre = ?,
             correo = ?,
             fecha_nacimiento = ?
         WHERE id_persona = ?"
    );

    $consulta->execute([
        $nombre,
        $correo,
        $fechaNacimiento,
        $usuarioActual["id_persona"]
    ]);

    responder(200, [
        "mensaje" =>
            "Perfil actualizado correctamente"
    ]);
}


responder(405, [
    "error" => "Metodo no permitido"
]);