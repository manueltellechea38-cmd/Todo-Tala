<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

$metodo = $_SERVER["REQUEST_METHOD"];


/*
Obtiene el comercio del jefe o empleado.
*/
function obtenerComercioPromocion($conexion, $usuario)
{
    $idPersona = (int) $usuario["id_persona"];

    if ($usuario["rol"] === "jefe") {

        $consulta = $conexion->prepare(
            "SELECT id_comercio
             FROM comercio
             WHERE id_jefe = ?"
        );

        $consulta->execute([$idPersona]);

    } elseif ($usuario["rol"] === "empleado") {

        $consulta = $conexion->prepare(
            "SELECT id_comercio
             FROM empleado
             WHERE id_persona = ?"
        );

        $consulta->execute([$idPersona]);

    } else {
        return null;
    }

    $fila = $consulta->fetch(PDO::FETCH_ASSOC);

    return $fila
        ? (int) $fila["id_comercio"]
        : null;
}


/*
GET

Normal:
devuelve promociones activas y vigentes
para el catálogo.

?gestion=1:
solo jefe o empleado y solamente
las promociones de su comercio.
*/
if ($metodo === "GET") {

    $gestion =
        isset($_GET["gestion"]) &&
        $_GET["gestion"] === "1";

    if ($gestion) {

        $usuario = requerirRol(
            $conexion,
            ["jefe", "empleado"]
        );

        $idComercio =
            obtenerComercioPromocion(
                $conexion,
                $usuario
            );

        if ($idComercio === null) {
            responder(404, [
                "error" => "Comercio no encontrado"
            ]);
        }

        $sql = "SELECT
                    pr.id_promocion,
                    pr.id_producto,
                    pr.nombre,
                    pr.tipo,
                    pr.valor,
                    pr.fecha_inicio,
                    pr.fecha_fin,
                    pr.estado,
                    p.nombre AS producto,
                    p.precio AS precio_base
                FROM promocion pr
                INNER JOIN producto p
                    ON p.id_producto = pr.id_producto
                WHERE p.id_comercio = ?";

        $parametros = [$idComercio];

        if (isset($_GET["id"])) {
            $sql .= " AND pr.id_promocion = ?";
            $parametros[] = intval($_GET["id"]);
        }

        $sql .= " ORDER BY pr.id_promocion DESC";

        $consulta = $conexion->prepare($sql);
        $consulta->execute($parametros);

        $promociones =
            $consulta->fetchAll(PDO::FETCH_ASSOC);

        if (isset($_GET["id"])) {

            if (count($promociones) === 0) {
                responder(404, [
                    "error" =>
                        "Promoción no encontrada"
                ]);
            }

            responder(
                200,
                $promociones[0]
            );
        }

        responder(200, $promociones);
    }


    /*
    GET público.
    Solo promociones activas y vigentes.
    */
    $sql = "SELECT
                pr.id_promocion,
                pr.id_producto,
                pr.nombre,
                pr.tipo,
                pr.valor,
                pr.fecha_inicio,
                pr.fecha_fin,
                pr.estado,
                p.precio AS precio_base
            FROM promocion pr
            INNER JOIN producto p
                ON p.id_producto = pr.id_producto
            WHERE pr.estado = 'Activa'
              AND p.visible = 1
              AND (
                    pr.fecha_inicio IS NULL
                    OR pr.fecha_inicio <= CURDATE()
                  )
              AND (
                    pr.fecha_fin IS NULL
                    OR pr.fecha_fin >= CURDATE()
                  )";

    if (isset($_GET["id_producto"])) {

        $sql .= " AND pr.id_producto = ?";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            intval($_GET["id_producto"])
        ]);

    } else {

        $consulta = $conexion->query($sql);
    }

    responder(
        200,
        $consulta->fetchAll(PDO::FETCH_ASSOC)
    );
}


/*
Desde acá en adelante solamente
jefe o empleado.
*/
$usuario = requerirRol(
    $conexion,
    ["jefe", "empleado"]
);

$idComercio =
    obtenerComercioPromocion(
        $conexion,
        $usuario
    );

if ($idComercio === null) {
    responder(404, [
        "error" => "Comercio no encontrado"
    ]);
}


/*
POST
Crea una promoción.
*/
if ($metodo === "POST") {

    $datos = leerJson();

    $idProducto =
        isset($datos["id_producto"])
            ? intval($datos["id_producto"])
            : 0;

    $nombre =
        isset($datos["nombre"])
            ? trim($datos["nombre"])
            : "";

    $tipo =
        isset($datos["tipo"])
            ? trim($datos["tipo"])
            : "";

    $valor =
        isset($datos["valor"])
            ? floatval($datos["valor"])
            : 0;

    $fechaInicio =
        !empty($datos["fecha_inicio"])
            ? $datos["fecha_inicio"]
            : null;

    $fechaFin =
        !empty($datos["fecha_fin"])
            ? $datos["fecha_fin"]
            : null;

    $estado =
        $datos["estado"] ?? "Inactiva";


    if (
        $idProducto <= 0 ||
        $nombre === "" ||
        $valor <= 0
    ) {
        responder(400, [
            "error" =>
                "Revisá los datos de la promoción"
        ]);
    }

    if (
        $tipo !== "porcentaje" &&
        $tipo !== "precio"
    ) {
        responder(400, [
            "error" =>
                "Tipo de promoción no válido"
        ]);
    }

    if (
        $estado !== "Activa" &&
        $estado !== "Inactiva"
    ) {
        responder(400, [
            "error" => "Estado no válido"
        ]);
    }

    if (
        $fechaInicio &&
        $fechaFin &&
        $fechaFin < $fechaInicio
    ) {
        responder(400, [
            "error" =>
                "La fecha final no puede ser anterior a la inicial"
        ]);
    }

    if (
        $tipo === "porcentaje" &&
        $valor > 100
    ) {
        responder(400, [
            "error" =>
                "El porcentaje no puede superar 100"
        ]);
    }


    /*
    El producto debe pertenecer
    al comercio autenticado.
    */
    $consulta = $conexion->prepare(
        "SELECT id_producto, precio
         FROM producto
         WHERE id_producto = ?
           AND id_comercio = ?"
    );

    $consulta->execute([
        $idProducto,
        $idComercio
    ]);

    $producto =
        $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$producto) {
        responder(404, [
            "error" =>
                "Producto no encontrado en tu comercio"
        ]);
    }

    /*
    Precio promocional no puede ser
    mayor al precio normal.
    */
    if (
        $tipo === "precio" &&
        $valor >= (float) $producto["precio"]
    ) {
        responder(400, [
            "error" =>
                "El precio promocional debe ser menor al precio normal"
        ]);
    }


    /*
    Si se intenta crear como activa,
    no permitimos otra promoción activa
    para el mismo producto.
    */
    if ($estado === "Activa") {

        $consulta = $conexion->prepare(
            "SELECT id_promocion
             FROM promocion
             WHERE id_producto = ?
               AND estado = 'Activa'
             LIMIT 1"
        );

        $consulta->execute([$idProducto]);

        if ($consulta->fetch()) {
            responder(409, [
                "error" =>
                    "Ese producto ya tiene una promoción activa"
            ]);
        }
    }


    $sql = "INSERT INTO promocion
            (
                id_producto,
                nombre,
                tipo,
                valor,
                fecha_inicio,
                fecha_fin,
                estado
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $idProducto,
        $nombre,
        $tipo,
        $valor,
        $fechaInicio,
        $fechaFin,
        $estado
    ]);

    responder(201, [
        "mensaje" =>
            "Promoción creada correctamente",
        "id_promocion" =>
            (int) $conexion->lastInsertId()
    ]);
}


/*
PUT
Edita o activa/desactiva.
*/
if ($metodo === "PUT") {

    if (!isset($_GET["id"])) {
        responder(400, [
            "error" =>
                "Falta el id de la promoción"
        ]);
    }

    $idPromocion =
        intval($_GET["id"]);

    /*
    La promoción debe pertenecer
    al comercio autenticado.
    */
    $consulta = $conexion->prepare(
        "SELECT pr.*
         FROM promocion pr
         INNER JOIN producto p
            ON p.id_producto = pr.id_producto
         WHERE pr.id_promocion = ?
           AND p.id_comercio = ?"
    );

    $consulta->execute([
        $idPromocion,
        $idComercio
    ]);

    $actual =
        $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$actual) {
        responder(404, [
            "error" =>
                "Promoción no encontrada"
        ]);
    }

    $datos = leerJson();

    $idProducto =
        isset($datos["id_producto"])
            ? intval($datos["id_producto"])
            : (int) $actual["id_producto"];

    $nombre =
        isset($datos["nombre"])
            ? trim($datos["nombre"])
            : $actual["nombre"];

    $tipo =
        $datos["tipo"] ??
        $actual["tipo"];

    $valor =
        isset($datos["valor"])
            ? floatval($datos["valor"])
            : (float) $actual["valor"];

    $fechaInicio =
        array_key_exists(
            "fecha_inicio",
            $datos
        )
            ? $datos["fecha_inicio"]
            : $actual["fecha_inicio"];

    $fechaFin =
        array_key_exists(
            "fecha_fin",
            $datos
        )
            ? $datos["fecha_fin"]
            : $actual["fecha_fin"];

    $estado =
        $datos["estado"] ??
        $actual["estado"];


    if (
        $tipo !== "porcentaje" &&
        $tipo !== "precio"
    ) {
        responder(400, [
            "error" =>
                "Tipo de promoción no válido"
        ]);
    }

    if (
        $estado !== "Activa" &&
        $estado !== "Inactiva"
    ) {
        responder(400, [
            "error" => "Estado no válido"
        ]);
    }

    if (
        $nombre === "" ||
        $valor <= 0
    ) {
        responder(400, [
            "error" =>
                "Revisá los datos de la promoción"
        ]);
    }

    if (
        $fechaInicio &&
        $fechaFin &&
        $fechaFin < $fechaInicio
    ) {
        responder(400, [
            "error" =>
                "Las fechas no son válidas"
        ]);
    }

    if (
        $tipo === "porcentaje" &&
        $valor > 100
    ) {
        responder(400, [
            "error" =>
                "El porcentaje no puede superar 100"
        ]);
    }


    /*
    Si cambió el producto,
    también debe ser del mismo comercio.
    */
    $consulta = $conexion->prepare(
        "SELECT id_producto, precio
         FROM producto
         WHERE id_producto = ?
           AND id_comercio = ?"
    );

    $consulta->execute([
        $idProducto,
        $idComercio
    ]);

    $producto =
        $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$producto) {
        responder(404, [
            "error" =>
                "Producto no encontrado en tu comercio"
        ]);
    }


    if (
        $tipo === "precio" &&
        $valor >= (float) $producto["precio"]
    ) {
        responder(400, [
            "error" =>
                "El precio promocional debe ser menor al precio normal"
        ]);
    }


    if ($estado === "Activa") {

        $consulta = $conexion->prepare(
            "SELECT id_promocion
             FROM promocion
             WHERE id_producto = ?
               AND estado = 'Activa'
               AND id_promocion <> ?
             LIMIT 1"
        );

        $consulta->execute([
            $idProducto,
            $idPromocion
        ]);

        if ($consulta->fetch()) {
            responder(409, [
                "error" =>
                    "Ese producto ya tiene otra promoción activa"
            ]);
        }
    }


    $sql = "UPDATE promocion
            SET id_producto = ?,
                nombre = ?,
                tipo = ?,
                valor = ?,
                fecha_inicio = ?,
                fecha_fin = ?,
                estado = ?
            WHERE id_promocion = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $idProducto,
        $nombre,
        $tipo,
        $valor,
        $fechaInicio,
        $fechaFin,
        $estado,
        $idPromocion
    ]);

    responder(200, [
        "mensaje" =>
            "Promoción actualizada correctamente"
    ]);
}


/*
DELETE
*/
if ($metodo === "DELETE") {

    if (!isset($_GET["id"])) {
        responder(400, [
            "error" =>
                "Falta el id de la promoción"
        ]);
    }

    $idPromocion =
        intval($_GET["id"]);

    $consulta = $conexion->prepare(
        "DELETE pr
         FROM promocion pr
         INNER JOIN producto p
            ON p.id_producto = pr.id_producto
         WHERE pr.id_promocion = ?
           AND p.id_comercio = ?"
    );

    $consulta->execute([
        $idPromocion,
        $idComercio
    ]);

    if ($consulta->rowCount() === 0) {
        responder(404, [
            "error" =>
                "Promoción no encontrada"
        ]);
    }

    responder(200, [
        "mensaje" =>
            "Promoción eliminada correctamente"
    ]);
}


responder(405, [
    "error" => "Método no permitido"
]);