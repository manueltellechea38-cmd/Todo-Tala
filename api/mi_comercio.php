<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

$usuario = requerirRol(
    $conexion,
    ["jefe", "empleado"]
);

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    responder(405, [
        "error" => "Metodo no permitido"
    ]);
}


/*
Obtiene el comercio correspondiente
al usuario autenticado.
*/
if ($usuario["rol"] === "jefe") {

    $consulta = $conexion->prepare(
        "SELECT
            id_comercio,
            nombre,
            ruc,
            telefono,
            direccion,
            horario
         FROM comercio
         WHERE id_jefe = ?"
    );

    $consulta->execute([
        $usuario["id_persona"]
    ]);

} else {

    $consulta = $conexion->prepare(
        "SELECT
            c.id_comercio,
            c.nombre,
            c.ruc,
            c.telefono,
            c.direccion,
            c.horario

         FROM empleado e

         INNER JOIN comercio c
            ON c.id_comercio = e.id_comercio

         WHERE e.id_persona = ?"
    );

    $consulta->execute([
        $usuario["id_persona"]
    ]);
}

$comercio =
    $consulta->fetch(PDO::FETCH_ASSOC);

if (!$comercio) {
    responder(404, [
        "error" => "Comercio no encontrado"
    ]);
}

responder(200, $comercio);