<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

$usuario = requerirLogin($conexion);
$metodo = $_SERVER["REQUEST_METHOD"];


/*
Obtiene el comercio del jefe o empleado autenticado.
*/
function obtenerComercioUsuario($conexion, $usuario) {

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
Agrega los productos a cada pedido obtenido.
*/
function agregarDetallePedidos($conexion, $pedidos) {

    foreach ($pedidos as &$pedido) {

        $consulta = $conexion->prepare(
            "SELECT
                pp.id_producto,
                p.nombre,
                p.marca,
                pp.cantidad,
                pp.precio_unitario,
                (pp.cantidad * pp.precio_unitario) AS subtotal
             FROM pedido_producto pp
             INNER JOIN producto p
                ON p.id_producto = pp.id_producto
             WHERE pp.id_pedido = ?
             ORDER BY p.nombre"
        );

        $consulta->execute([
            $pedido["id_pedido"]
        ]);

        $pedido["productos"] =
            $consulta->fetchAll(PDO::FETCH_ASSOC);
    }

    return $pedidos;
}


/*
GET
Cliente: solamente sus pedidos.
Jefe/empleado: solamente pedidos de su comercio.
*/
if ($metodo === "GET") {

    $parametros = [];

    $sql = "SELECT
                pe.*,
                c.nombre AS comercio,
                COALESCE(
                    SUM(
                        pp.cantidad *
                        pp.precio_unitario
                    ),
                    0
                ) AS total
            FROM pedido pe
            INNER JOIN comercio c
                ON c.id_comercio = pe.id_comercio
            LEFT JOIN pedido_producto pp
                ON pp.id_pedido = pe.id_pedido";

    if ($usuario["rol"] === "cliente") {

        $sql .= " WHERE pe.id_cliente = ?";
        $parametros[] =
            (int) $usuario["id_persona"];

    } elseif (
        $usuario["rol"] === "jefe" ||
        $usuario["rol"] === "empleado"
    ) {

        $idComercio =
            obtenerComercioUsuario(
                $conexion,
                $usuario
            );

        if ($idComercio === null) {
            responder(404, [
                "error" => "Comercio no encontrado"
            ]);
        }

        $sql .= " WHERE pe.id_comercio = ?";
        $parametros[] = $idComercio;

    } else {

        responder(403, [
            "error" => "No autorizado"
        ]);
    }

    /*
    Si se pide un pedido específico,
    también debe pertenecer al usuario.
    */
    if (isset($_GET["id"])) {

        $sql .= " AND pe.id_pedido = ?";
        $parametros[] =
            intval($_GET["id"]);
    }

    $sql .= "
        GROUP BY pe.id_pedido
        ORDER BY pe.fecha_pedido DESC";

    $consulta = $conexion->prepare($sql);
    $consulta->execute($parametros);

    $pedidos =
        $consulta->fetchAll(PDO::FETCH_ASSOC);

    $pedidos =
        agregarDetallePedidos(
            $conexion,
            $pedidos
        );

    if (isset($_GET["id"])) {

        if (count($pedidos) === 0) {
            responder(404, [
                "error" => "Pedido no encontrado"
            ]);
        }

        responder(200, $pedidos[0]);
    }

    responder(200, $pedidos);
}


/*
POST
Crea los pedidos usando directamente
el carrito del cliente autenticado.
*/
if ($metodo === "POST") {

    if ($usuario["rol"] !== "cliente") {
        responder(403, [
            "error" =>
                "Solo los clientes pueden crear pedidos"
        ]);
    }
$datos = leerJson();

$observacion = isset($datos["observacion"])
    ? trim($datos["observacion"])
    : "";

if (strlen($observacion) > 255) {
    responder(400, [
        "error" => "La observación no puede superar los 255 caracteres"
    ]);
}

if ($observacion === "") {
    $observacion = null;
}
    $idCliente =
        (int) $usuario["id_persona"];

    try {

        $conexion->beginTransaction();

        /*
        Buscamos el carrito activo.
        */
        $consulta = $conexion->prepare(
            "SELECT id_carrito
             FROM carrito
             WHERE id_cliente = ?
               AND estado = 'activo'
             ORDER BY id_carrito DESC
             LIMIT 1"
        );

        $consulta->execute([$idCliente]);

        $carrito =
            $consulta->fetch(PDO::FETCH_ASSOC);

        if (!$carrito) {
            throw new Exception(
                "El carrito está vacío"
            );
        }

        $idCarrito =
            (int) $carrito["id_carrito"];

        /*
        Traemos los productos reales del carrito.
        FOR UPDATE bloquea esos productos
        mientras se crea el pedido.
        */
        $consulta = $conexion->prepare(
            "SELECT
                cp.id_producto,
                cp.cantidad,
                p.id_comercio,
                p.nombre,
                p.precio,
                p.stock,
                p.visible
             FROM carrito_producto cp
             INNER JOIN producto p
                ON p.id_producto =
                   cp.id_producto
             WHERE cp.id_carrito = ?
             FOR UPDATE"
        );

        $consulta->execute([$idCarrito]);

        $productos =
            $consulta->fetchAll(PDO::FETCH_ASSOC);

        if (count($productos) === 0) {
            throw new Exception(
                "El carrito está vacío"
            );
        }

        /*
        Agrupamos por comercio porque
        cada comercio recibe un pedido separado.
        */
        $grupos = [];

        foreach ($productos as $producto) {

            if ((int) $producto["visible"] !== 1) {
                throw new Exception(
                    "El producto " .
                    $producto["nombre"] .
                    " ya no está disponible"
                );
            }

            if (
                (int) $producto["stock"] <
                (int) $producto["cantidad"]
            ) {
                throw new Exception(
                    "Stock insuficiente para " .
                    $producto["nombre"]
                );
            }

            $idComercio =
                (int) $producto["id_comercio"];

            if (!isset($grupos[$idComercio])) {
                $grupos[$idComercio] = [];
            }

            $grupos[$idComercio][] =
                $producto;
        }

        $pedidosCreados = [];

        /*
        Creamos un pedido por comercio.
        */
        foreach (
            $grupos as
            $idComercio => $productosGrupo
        ) {

            $consulta = $conexion->prepare(
    "INSERT INTO pedido
     (
        id_cliente,
        id_comercio,
        estado,
        observacion
     )
     VALUES (?, ?, 'Pendiente', ?)"
);

$consulta->execute([
    $idCliente,
    $idComercio,
    $observacion
]);

            $idPedido =
                (int) $conexion->lastInsertId();

            /*
            Guardamos productos y descontamos stock.
            El precio siempre sale de MySQL.
            */
            foreach (
                $productosGrupo as $producto
            ) {

                $consulta = $conexion->prepare(
                    "INSERT INTO pedido_producto
                     (
                        id_pedido,
                        id_producto,
                        cantidad,
                        precio_unitario
                     )
                     VALUES (?, ?, ?, ?)"
                );

                $consulta->execute([
                    $idPedido,
                    $producto["id_producto"],
                    $producto["cantidad"],
                    $producto["precio"]
                ]);

                $consulta = $conexion->prepare(
                    "UPDATE producto
                     SET stock = stock - ?
                     WHERE id_producto = ?"
                );

                $consulta->execute([
                    $producto["cantidad"],
                    $producto["id_producto"]
                ]);
            }

            $pedidosCreados[] = [
                "id_pedido" => $idPedido,
                "id_comercio" => $idComercio
            ];
        }

        /*
        Vacíamos el carrito usado.
        */
        $consulta = $conexion->prepare(
            "DELETE FROM carrito_producto
             WHERE id_carrito = ?"
        );

        $consulta->execute([$idCarrito]);

        /*
        Lo marcamos como confirmado.
        La próxima vez carrito.php
        creará un carrito activo nuevo.
        */
        $consulta = $conexion->prepare(
            "UPDATE carrito
             SET estado = 'confirmado'
             WHERE id_carrito = ?"
        );

        $consulta->execute([$idCarrito]);

        $conexion->commit();

        responder(201, [
            "mensaje" =>
                count($pedidosCreados) === 1
                    ? "Pedido creado correctamente"
                    : "Pedidos creados correctamente",

            "pedidos" =>
                $pedidosCreados
        ]);

    } catch (Exception $e) {

        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }

        responder(400, [
            "error" => $e->getMessage()
        ]);
    }
}

/*
PUT
Por ahora permite que un cliente cancele
solamente sus propios pedidos.
*/
if ($metodo === "PUT") {

    if (!isset($_GET["id"])) {
        responder(400, [
            "error" => "Falta el id del pedido"
        ]);
    }

    if ($usuario["rol"] !== "cliente") {
        responder(403, [
            "error" => "No autorizado"
        ]);
    }

    $idPedido = intval($_GET["id"]);
    $datos = leerJson();

    $nuevoEstado = $datos["estado"] ?? "";

    if ($nuevoEstado !== "Cancelado") {
        responder(400, [
            "error" => "Estado no permitido"
        ]);
    }

    $motivo = isset($datos["motivo_cancelacion"])
        ? trim($datos["motivo_cancelacion"])
        : "";

    if ($motivo === "") {
        responder(400, [
            "error" => "Debés indicar el motivo de cancelación"
        ]);
    }

    if (strlen($motivo) > 255) {
        responder(400, [
            "error" => "El motivo es demasiado largo"
        ]);
    }

    try {

        $conexion->beginTransaction();

        /*
        Buscamos el pedido y comprobamos
        que pertenezca al cliente autenticado.
        */
        $consulta = $conexion->prepare(
            "SELECT id_pedido, estado
             FROM pedido
             WHERE id_pedido = ?
               AND id_cliente = ?
             FOR UPDATE"
        );

        $consulta->execute([
            $idPedido,
            $usuario["id_persona"]
        ]);

        $pedido = $consulta->fetch(PDO::FETCH_ASSOC);

        if (!$pedido) {
            throw new Exception(
                "Pedido no encontrado"
            );
        }

        $estadosCancelables = [
            "Pendiente",
            "Aceptado",
            "En preparación"
        ];

        if (
            !in_array(
                $pedido["estado"],
                $estadosCancelables,
                true
            )
        ) {
            throw new Exception(
                "Este pedido ya no se puede cancelar"
            );
        }

        /*
        Recuperamos los productos del pedido.
        */
        $consulta = $conexion->prepare(
            "SELECT id_producto, cantidad
             FROM pedido_producto
             WHERE id_pedido = ?"
        );

        $consulta->execute([$idPedido]);

        $productos =
            $consulta->fetchAll(PDO::FETCH_ASSOC);

        /*
        Devolvemos el stock.
        */
        foreach ($productos as $producto) {

            $consulta = $conexion->prepare(
                "UPDATE producto
                 SET stock = stock + ?
                 WHERE id_producto = ?"
            );

            $consulta->execute([
                $producto["cantidad"],
                $producto["id_producto"]
            ]);
        }

        /*
        Marcamos el pedido como cancelado.
        */
        $consulta = $conexion->prepare(
            "UPDATE pedido
             SET estado = 'Cancelado',
                 motivo_cancelacion = ?
             WHERE id_pedido = ?"
        );

        $consulta->execute([
            $motivo,
            $idPedido
        ]);

        $conexion->commit();

        responder(200, [
            "mensaje" =>
                "Pedido cancelado correctamente"
        ]);

    } catch (Exception $e) {

        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }

        responder(400, [
            "error" => $e->getMessage()
        ]);
    }
}

responder(405, [
    "error" => "Método no permitido"
]);