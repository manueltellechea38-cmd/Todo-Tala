<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

/*
Obtiene el comercio del jefe o empleado autenticado.
*/
function obtenerIdComercio($conexion, $usuario) {

    if ($usuario["rol"] === "jefe") {

        $sql = "SELECT id_comercio
                FROM comercio
                WHERE id_jefe = ?";

        $consulta = $conexion->prepare($sql);
        $consulta->execute([$usuario["id_persona"]]);

    } else {

        $sql = "SELECT id_comercio
                FROM empleado
                WHERE id_persona = ?";

        $consulta = $conexion->prepare($sql);
        $consulta->execute([$usuario["id_persona"]]);
    }

    $comercio = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$comercio) {
        responder(404, [
            "error" => "No se encontro el comercio del usuario"
        ]);
    }

    return (int) $comercio["id_comercio"];
}

$metodo = $_SERVER["REQUEST_METHOD"];

/*
GET PUBLICO

Por defecto muestra solamente productos visibles.
Con ?gestion=1, un jefe o empleado puede ver todos
los productos de su propio comercio, incluso ocultos.
*/
if ($metodo === "GET") {

    $gestion =
        isset($_GET["gestion"]) &&
        $_GET["gestion"] === "1";

    $parametros = [];

    $sql = "SELECT
                p.id_producto,
                p.id_comercio,
                p.id_categoria,
                p.nombre,
                p.marca,
                p.precio,
                p.descripcion,
                p.stock,
                p.imagen,
                p.visible,
                ca.nombre AS categoria,
                co.nombre AS comercio
            FROM producto p
            INNER JOIN categoria ca
                ON ca.id_categoria = p.id_categoria
            INNER JOIN comercio co
                ON co.id_comercio = p.id_comercio";

    if ($gestion) {

        $usuario = requerirRol(
            $conexion,
            ["jefe", "empleado"]
        );

        $idComercio = obtenerIdComercio(
            $conexion,
            $usuario
        );

        $sql .= " WHERE p.id_comercio = ?";
        $parametros[] = $idComercio;

    } else {

        $sql .= " WHERE p.visible = 1";
    }

    /*
    Buscar un producto por id.
    */
    if (isset($_GET["id"])) {

        $sql .= " AND p.id_producto = ?";
        $parametros[] = intval($_GET["id"]);

        $consulta = $conexion->prepare($sql);
        $consulta->execute($parametros);

        $producto = $consulta->fetch(PDO::FETCH_ASSOC);

        if (!$producto) {
            responder(404, [
                "error" => "Producto no encontrado"
            ]);
        }

        responder(200, $producto);
    }

    /*
    Buscar por nombre.
    */
    if (
        isset($_GET["nombre"]) &&
        trim($_GET["nombre"]) !== ""
    ) {
        $sql .= " AND p.nombre LIKE ?";
        $parametros[] =
            "%" . trim($_GET["nombre"]) . "%";
    }

    /*
    Orden permitido.
    */
    $orden = "p.id_producto";
    $direccion = "ASC";

    if (isset($_GET["orden"])) {

        if ($_GET["orden"] === "nombre") {
            $orden = "p.nombre";
        }

        if ($_GET["orden"] === "precio") {
            $orden = "p.precio";
        }
    }

    if (
        isset($_GET["direccion"]) &&
        strtolower($_GET["direccion"]) === "desc"
    ) {
        $direccion = "DESC";
    }

    $sql .= " ORDER BY $orden $direccion";

    $consulta = $conexion->prepare($sql);
    $consulta->execute($parametros);

    responder(
        200,
        $consulta->fetchAll(PDO::FETCH_ASSOC)
    );
}

/*
A partir de aca solamente jefe o empleado
pueden modificar productos.
*/
$usuario = requerirRol(
    $conexion,
    ["jefe", "empleado"]
);

$idComercio = obtenerIdComercio(
    $conexion,
    $usuario
);

/*
CREAR PRODUCTO
*/
if ($metodo === "POST") {

    $datos = leerJson();

    $idCategoria = isset($datos["id_categoria"])
        ? intval($datos["id_categoria"])
        : 0;

    $nombre = isset($datos["nombre"])
        ? trim($datos["nombre"])
        : "";

    $marca = isset($datos["marca"])
        ? trim($datos["marca"])
        : null;

    $precio = isset($datos["precio"]) &&
              is_numeric($datos["precio"])
        ? (float) $datos["precio"]
        : -1;

    $descripcion = isset($datos["descripcion"])
        ? trim($datos["descripcion"])
        : null;

    $stock = isset($datos["stock"]) &&
             is_numeric($datos["stock"])
        ? (int) $datos["stock"]
        : -1;

    $imagen = isset($datos["imagen"])
        ? trim($datos["imagen"])
        : null;

    $visible = isset($datos["visible"])
        ? (int) ((bool) $datos["visible"])
        : 1;

    if (
        $idCategoria <= 0 ||
        $nombre === "" ||
        $precio < 0 ||
        $stock < 0
    ) {
        responder(400, [
            "error" => "Los datos del producto no son validos"
        ]);
    }

    /*
    Comprobamos que la categoria exista.
    */
    $consulta = $conexion->prepare(
        "SELECT id_categoria
         FROM categoria
         WHERE id_categoria = ?"
    );

    $consulta->execute([$idCategoria]);

    if (!$consulta->fetch()) {
        responder(400, [
            "error" => "La categoria no existe"
        ]);
    }

    $sql = "INSERT INTO producto
            (
                id_comercio,
                id_categoria,
                nombre,
                marca,
                precio,
                descripcion,
                stock,
                imagen,
                visible
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $idComercio,
        $idCategoria,
        $nombre,
        $marca,
        $precio,
        $descripcion,
        $stock,
        $imagen,
        $visible
    ]);

    responder(201, [
        "mensaje" => "Producto creado correctamente",
        "id" => (int) $conexion->lastInsertId()
    ]);
}

/*
ACTUALIZAR PRODUCTO
*/
if ($metodo === "PUT") {

    if (!isset($_GET["id"])) {
        responder(400, [
            "error" => "Falta el id del producto"
        ]);
    }

    $idProducto = intval($_GET["id"]);

    /*
    El producto debe pertenecer al comercio
    del usuario autenticado.
    */
    $sql = "SELECT *
            FROM producto
            WHERE id_producto = ?
              AND id_comercio = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $idProducto,
        $idComercio
    ]);

    $actual = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$actual) {
        responder(404, [
            "error" => "Producto no encontrado"
        ]);
    }

    $datos = leerJson();

    $idCategoria = isset($datos["id_categoria"])
        ? intval($datos["id_categoria"])
        : (int) $actual["id_categoria"];

    $nombre = isset($datos["nombre"])
        ? trim($datos["nombre"])
        : $actual["nombre"];

    $marca = array_key_exists("marca", $datos)
        ? trim((string) $datos["marca"])
        : $actual["marca"];

    $precio = isset($datos["precio"]) &&
              is_numeric($datos["precio"])
        ? (float) $datos["precio"]
        : (float) $actual["precio"];

    $descripcion = array_key_exists(
        "descripcion",
        $datos
    )
        ? trim((string) $datos["descripcion"])
        : $actual["descripcion"];

    $stock = isset($datos["stock"]) &&
             is_numeric($datos["stock"])
        ? (int) $datos["stock"]
        : (int) $actual["stock"];

    $imagen = array_key_exists("imagen", $datos)
        ? trim((string) $datos["imagen"])
        : $actual["imagen"];

    $visible = array_key_exists("visible", $datos)
        ? (int) ((bool) $datos["visible"])
        : (int) $actual["visible"];

    if (
        $idCategoria <= 0 ||
        $nombre === "" ||
        $precio < 0 ||
        $stock < 0
    ) {
        responder(400, [
            "error" => "Los datos del producto no son validos"
        ]);
    }

    $consulta = $conexion->prepare(
        "SELECT id_categoria
         FROM categoria
         WHERE id_categoria = ?"
    );

    $consulta->execute([$idCategoria]);

    if (!$consulta->fetch()) {
        responder(400, [
            "error" => "La categoria no existe"
        ]);
    }

    $sql = "UPDATE producto
            SET id_categoria = ?,
                nombre = ?,
                marca = ?,
                precio = ?,
                descripcion = ?,
                stock = ?,
                imagen = ?,
                visible = ?
            WHERE id_producto = ?
              AND id_comercio = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $idCategoria,
        $nombre,
        $marca,
        $precio,
        $descripcion,
        $stock,
        $imagen,
        $visible,
        $idProducto,
        $idComercio
    ]);

    responder(200, [
        "mensaje" => "Producto actualizado correctamente"
    ]);
}

/*
ELIMINAR PRODUCTO
*/
if ($metodo === "DELETE") {

    if (!isset($_GET["id"])) {
        responder(400, [
            "error" => "Falta el id del producto"
        ]);
    }

    $idProducto = intval($_GET["id"]);

    $sql = "SELECT id_producto
            FROM producto
            WHERE id_producto = ?
              AND id_comercio = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $idProducto,
        $idComercio
    ]);

    if (!$consulta->fetch()) {
        responder(404, [
            "error" => "Producto no encontrado"
        ]);
    }

    try {

        $sql = "DELETE FROM producto
                WHERE id_producto = ?
                  AND id_comercio = ?";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $idProducto,
            $idComercio
        ]);

        responder(200, [
            "mensaje" => "Producto eliminado correctamente"
        ]);

    } catch (PDOException $e) {

        if ($e->getCode() === "23000") {
            responder(409, [
                "error" => "El producto tiene datos relacionados. Podes ocultarlo en lugar de eliminarlo"
            ]);
        }

        responder(500, [
            "error" => "Error interno del servidor"
        ]);
    }
}

responder(405, [
    "error" => "Metodo no permitido"
]);