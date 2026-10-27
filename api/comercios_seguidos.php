<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

$usuario = requerirRol(
    $conexion,
    ["cliente"]
);

$idCliente = (int) $usuario["id_persona"];

$metodo = $_SERVER["REQUEST_METHOD"];


/*
GET

Sin id:
devuelve todos los comercios seguidos.

Con ?id=3:
indica si ese comercio está seguido.
*/
if ($metodo === "GET") {

    if (isset($_GET["id"])) {

        $idComercio = intval($_GET["id"]);

        $consulta = $conexion->prepare(
            "SELECT 1
             FROM comercio_seguido
             WHERE id_cliente = ?
               AND id_comercio = ?"
        );

        $consulta->execute([
            $idCliente,
            $idComercio
        ]);

        responder(200, [
            "seguido" =>
                (bool) $consulta->fetchColumn()
        ]);
    }

    $consulta = $conexion->prepare(
        "SELECT
            cs.id_comercio,
            c.nombre,
            c.ruc,
            c.telefono,
            c.direccion,
            c.horario

         FROM comercio_seguido cs

         INNER JOIN comercio c
            ON c.id_comercio = cs.id_comercio

         WHERE cs.id_cliente = ?

         ORDER BY c.nombre"
    );

    $consulta->execute([
        $idCliente
    ]);

    responder(
        200,
        $consulta->fetchAll(PDO::FETCH_ASSOC)
    );
}


/*
POST

Sigue un comercio.
*/
if ($metodo === "POST") {

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $idComercio =
        intval($datos["id_comercio"] ?? 0);

    if ($idComercio <= 0) {
        responder(400, [
            "error" => "Comercio invalido"
        ]);
    }

    $consulta = $conexion->prepare(
        "SELECT id_comercio
         FROM comercio
         WHERE id_comercio = ?"
    );

    $consulta->execute([
        $idComercio
    ]);

    if (!$consulta->fetch(PDO::FETCH_ASSOC)) {
        responder(404, [
            "error" => "Comercio no encontrado"
        ]);
    }

    $consulta = $conexion->prepare(
        "INSERT IGNORE INTO comercio_seguido
         (
            id_cliente,
            id_comercio
         )
         VALUES (?, ?)"
    );

    $consulta->execute([
        $idCliente,
        $idComercio
    ]);

    responder(201, [
        "mensaje" =>
            "Comercio agregado a seguidos"
    ]);
}


/*
DELETE

Deja de seguir un comercio.
Ejemplo:
DELETE /comercios_seguidos.php?id=3
*/
if ($metodo === "DELETE") {

    $idComercio =
        intval($_GET["id"] ?? 0);

    if ($idComercio <= 0) {
        responder(400, [
            "error" => "Comercio invalido"
        ]);
    }

    $consulta = $conexion->prepare(
        "DELETE FROM comercio_seguido
         WHERE id_cliente = ?
           AND id_comercio = ?"
    );

    $consulta->execute([
        $idCliente,
        $idComercio
    ]);

    responder(200, [
        "mensaje" =>
            "Comercio eliminado de seguidos"
    ]);
}


responder(405, [
    "error" => "Metodo no permitido"
]);