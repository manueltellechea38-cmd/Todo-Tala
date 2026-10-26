<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

/*
El carrito pertenece siempre al cliente autenticado.
*/
$usuario = requerirRol(
    $conexion,
    ["cliente"]
);

$idCliente = (int) $usuario["id_persona"];
$metodo = $_SERVER["REQUEST_METHOD"];

/*
Busca el carrito activo del cliente.
*/
function obtenerCarritoActivo($conexion, $idCliente) {

    $sql = "SELECT id_carrito
            FROM carrito
            WHERE id_cliente = ?
              AND estado = 'activo'
            ORDER BY id_carrito DESC
            LIMIT 1";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$idCliente]);

    $carrito = $consulta->fetch(PDO::FETCH_ASSOC);

    return $carrito
        ? (int) $carrito["id_carrito"]
        : null;
}

/*
Crea un carrito si el cliente todavía no tiene uno activo.
*/
function obtenerOCrearCarrito($conexion, $idCliente) {

    $idCarrito = obtenerCarritoActivo(
        $conexion,
        $idCliente
    );

    if ($idCarrito !== null) {
        return $idCarrito;
    }

    $sql = "INSERT INTO carrito
            (id_cliente, estado)
            VALUES (?, 'activo')";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$idCliente]);

    return (int) $conexion->lastInsertId();
}

/*
LISTAR CARRITO
*/
if ($metodo === "GET") {

    $idCarrito = obtenerCarritoActivo(
        $conexion,
        $idCliente
    );

    if ($idCarrito === null) {
        responder(200, []);
    }

$sql = "SELECT
            p.id_producto,
            p.nombre,
            p.marca,

            p.precio AS precio_base,

            CASE
                WHEN pr.id_promocion IS NULL
                    THEN p.precio

                WHEN pr.tipo = 'porcentaje'
                    THEN ROUND(
                        p.precio * (1 - pr.valor / 100),
                        2
                    )

                WHEN pr.tipo = 'precio'
                    THEN pr.valor

                ELSE p.precio
            END AS precio,

            p.stock,
            p.imagen,
            p.visible,
            p.id_comercio,
            c.nombre AS comercio,
            c.direccion,
            cp.cantidad,

            (
                CASE
                    WHEN pr.id_promocion IS NULL
                        THEN p.precio

                    WHEN pr.tipo = 'porcentaje'
                        THEN ROUND(
                            p.precio * (1 - pr.valor / 100),
                            2
                        )

                    WHEN pr.tipo = 'precio'
                        THEN pr.valor

                    ELSE p.precio
                END
                * cp.cantidad
            ) AS subtotal

        FROM carrito_producto cp

        INNER JOIN producto p
            ON p.id_producto = cp.id_producto

        INNER JOIN comercio c
            ON c.id_comercio = p.id_comercio

        LEFT JOIN promocion pr
            ON pr.id_producto = p.id_producto
           AND pr.estado = 'Activa'
           AND (
                pr.fecha_inicio IS NULL
                OR pr.fecha_inicio <= CURDATE()
           )
           AND (
                pr.fecha_fin IS NULL
                OR pr.fecha_fin >= CURDATE()
           )

        WHERE cp.id_carrito = ?

        ORDER BY c.nombre, p.nombre";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$idCarrito]);

    responder(
        200,
        $consulta->fetchAll(PDO::FETCH_ASSOC)
    );
}

/*
AGREGAR PRODUCTO
*/
if ($metodo === "POST") {

    $datos = leerJson();

    $idProducto = isset($datos["id_producto"])
        ? intval($datos["id_producto"])
        : 0;

    $cantidad = isset($datos["cantidad"])
        ? intval($datos["cantidad"])
        : 1;

    if ($idProducto <= 0 || $cantidad <= 0) {
        responder(400, [
            "error" => "Producto o cantidad no validos"
        ]);
    }

    /*
    Comprobamos que el producto exista,
    esté publicado y tenga stock.
    */
    $sql = "SELECT id_producto, stock
            FROM producto
            WHERE id_producto = ?
              AND visible = 1";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$idProducto]);

    $producto = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$producto) {
        responder(404, [
            "error" => "Producto no encontrado"
        ]);
    }

    $idCarrito = obtenerOCrearCarrito(
        $conexion,
        $idCliente
    );

    /*
    Vemos si el producto ya estaba en el carrito.
    */
    $sql = "SELECT cantidad
            FROM carrito_producto
            WHERE id_carrito = ?
              AND id_producto = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $idCarrito,
        $idProducto
    ]);

    $existente = $consulta->fetch(PDO::FETCH_ASSOC);

    $cantidadActual = $existente
        ? (int) $existente["cantidad"]
        : 0;

    $nuevaCantidad =
        $cantidadActual + $cantidad;

    if ($nuevaCantidad > (int) $producto["stock"]) {
        responder(409, [
            "error" => "No hay suficiente stock disponible"
        ]);
    }

    if ($existente) {

        $sql = "UPDATE carrito_producto
                SET cantidad = ?
                WHERE id_carrito = ?
                  AND id_producto = ?";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $nuevaCantidad,
            $idCarrito,
            $idProducto
        ]);

    } else {

        $sql = "INSERT INTO carrito_producto
                (id_carrito, id_producto, cantidad)
                VALUES (?, ?, ?)";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $idCarrito,
            $idProducto,
            $cantidad
        ]);
    }

    responder(200, [
        "mensaje" => "Producto agregado al carrito"
    ]);
}

/*
CAMBIAR CANTIDAD
*/
if ($metodo === "PUT") {

    if (!isset($_GET["id"])) {
        responder(400, [
            "error" => "Falta el id del producto"
        ]);
    }

    $idProducto = intval($_GET["id"]);
    $datos = leerJson();

    $cantidad = isset($datos["cantidad"])
        ? intval($datos["cantidad"])
        : 0;

    if ($cantidad <= 0) {
        responder(400, [
            "error" => "La cantidad debe ser mayor a cero"
        ]);
    }

    $idCarrito = obtenerCarritoActivo(
        $conexion,
        $idCliente
    );

    if ($idCarrito === null) {
        responder(404, [
            "error" => "Carrito no encontrado"
        ]);
    }

    /*
    Comprobamos el stock actual.
    */
    $sql = "SELECT stock
            FROM producto
            WHERE id_producto = ?";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$idProducto]);

    $producto = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$producto) {
        responder(404, [
            "error" => "Producto no encontrado"
        ]);
    }

    if ($cantidad > (int) $producto["stock"]) {
        responder(409, [
            "error" => "No hay suficiente stock disponible"
        ]);
    }

    $sql = "UPDATE carrito_producto
            SET cantidad = ?
            WHERE id_carrito = ?
              AND id_producto = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $cantidad,
        $idCarrito,
        $idProducto
    ]);

    if ($consulta->rowCount() === 0) {

        $sql = "SELECT id_producto
                FROM carrito_producto
                WHERE id_carrito = ?
                  AND id_producto = ?";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $idCarrito,
            $idProducto
        ]);

        if (!$consulta->fetch()) {
            responder(404, [
                "error" => "Producto no encontrado en el carrito"
            ]);
        }
    }

    responder(200, [
        "mensaje" => "Cantidad actualizada"
    ]);
}

/*
ELIMINAR PRODUCTO O VACIAR CARRITO
*/
if ($metodo === "DELETE") {

    $idCarrito = obtenerCarritoActivo(
        $conexion,
        $idCliente
    );

    if ($idCarrito === null) {
        responder(200, [
            "mensaje" => "El carrito ya esta vacio"
        ]);
    }

    /*
    Si viene ?id=X eliminamos solamente ese producto.
    */
    if (isset($_GET["id"])) {

        $idProducto = intval($_GET["id"]);

        $sql = "DELETE FROM carrito_producto
                WHERE id_carrito = ?
                  AND id_producto = ?";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $idCarrito,
            $idProducto
        ]);

        responder(200, [
            "mensaje" => "Producto eliminado del carrito"
        ]);
    }

    /*
    Sin id vaciamos todo el carrito.
    */
    $sql = "DELETE FROM carrito_producto
            WHERE id_carrito = ?";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$idCarrito]);

    responder(200, [
        "mensaje" => "Carrito vaciado"
    ]);
}

responder(405, [
    "error" => "Metodo no permitido"
]);