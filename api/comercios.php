<?php

require_once "comun.php";
require_once "conexion.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    responder(405, [
        "error" => "Metodo no permitido"
    ]);
}


/*
GET PUBLICO

Permite consultar comercios.
No permite crear, editar ni eliminar.
*/
if (isset($_GET["id"])) {

    $idComercio =
        intval($_GET["id"]);

    if ($idComercio <= 0) {
        responder(400, [
            "error" => "Comercio invalido"
        ]);
    }

    $consulta = $conexion->prepare(
        "SELECT
            id_comercio,
            nombre,
            telefono,
            direccion,
            horario
         FROM comercio
         WHERE id_comercio = ?"
    );

    $consulta->execute([
        $idComercio
    ]);

    $comercio =
        $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$comercio) {
        responder(404, [
            "error" => "Comercio no encontrado"
        ]);
    }

    responder(200, $comercio);
}


/*
Lista publica de comercios.
No expone datos internos como id_jefe.
*/
$consulta = $conexion->query(
    "SELECT
        id_comercio,
        nombre,
        telefono,
        direccion,
        horario
     FROM comercio
     ORDER BY nombre"
);

responder(
    200,
    $consulta->fetchAll(PDO::FETCH_ASSOC)
);