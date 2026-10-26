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
devuelve todos los productos favoritos
del cliente autenticado.

Con ?id=3:
indica si ese producto es favorito.
*/
if ($metodo === "GET") {

    if (isset($_GET["id"])) {

        $idProducto = intval($_GET["id"]);

        $consulta = $conexion->prepare(
            "SELECT 1
             FROM producto_favorito
             WHERE id_cliente = ?
               AND id_producto = ?"
        );

        $consulta->execute([
            $idCliente,
            $idProducto
        ]);

        responder(200, [
            "favorito" =>
                (bool) $consulta->fetchColumn()
        ]);
    }

    $consulta = $conexion->prepare(
        "SELECT
            pf.id_producto,
            p.nombre,
            p.marca,
            p.precio,
            p.stock,
            p.imagen,
            p.id_comercio,
            c.nombre AS comercio,
            ca.nombre AS categoria

         FROM producto_favorito pf

         INNER JOIN producto p
            ON p.id_producto = pf.id_producto

         INNER JOIN comercio c
            ON c.id_comercio = p.id_comercio

         INNER JOIN categoria ca
            ON ca.id_categoria = p.id_categoria

         WHERE pf.id_cliente = ?
           AND p.visible = 1

         ORDER BY p.nombre"
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

Agrega un producto a favoritos.
*/
if ($metodo === "POST") {

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $idProducto =
        intval($datos["id_producto"] ?? 0);

    if ($idProducto <= 0) {
        responder(400, [
            "error" => "Producto invalido"
        ]);
    }

    $consulta = $conexion->prepare(
        "SELECT id_producto
         FROM producto
         WHERE id_producto = ?
           AND visible = 1"
    );

    $consulta->execute([
        $idProducto
    ]);

    if (!$consulta->fetch(PDO::FETCH_ASSOC)) {
        responder(404, [
            "error" => "Producto no encontrado"
        ]);
    }

    $consulta = $conexion->prepare(
        "INSERT IGNORE INTO producto_favorito
         (
            id_cliente,
            id_producto
         )
         VALUES (?, ?)"
    );

    $consulta->execute([
        $idCliente,
        $idProducto
    ]);

    responder(201, [
        "mensaje" =>
            "Producto agregado a favoritos"
    ]);
}


/*
DELETE

Quita un producto de favoritos.
Ejemplo:
DELETE /favoritos.php?id=3
*/
if ($metodo === "DELETE") {

    $idProducto =
        intval($_GET["id"] ?? 0);

    if ($idProducto <= 0) {
        responder(400, [
            "error" => "Producto invalido"
        ]);
    }

    $consulta = $conexion->prepare(
        "DELETE FROM producto_favorito
         WHERE id_cliente = ?
           AND id_producto = ?"
    );

    $consulta->execute([
        $idCliente,
        $idProducto
    ]);

    responder(200, [
        "mensaje" =>
            "Producto eliminado de favoritos"
    ]);
}


responder(405, [
    "error" => "Metodo no permitido"
]);