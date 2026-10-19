<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once "conexion.php";

$metodo = $_SERVER["REQUEST_METHOD"];

// Traemos los pedidos
if ($metodo === "GET") {

    if (isset($_GET["id"])) {

        $consulta = $conexion->prepare(
            "SELECT * FROM pedido
             WHERE id_pedido = ?"
        );

        $consulta->execute([
            intval($_GET["id"])
        ]);

        echo json_encode($consulta->fetch(PDO::FETCH_ASSOC));
        exit;
    }

    if (isset($_GET["cliente_id"])) {

        $consulta = $conexion->prepare(
            "SELECT * FROM pedido
             WHERE id_cliente = ?
             ORDER BY fecha_pedido DESC"
        );

        $consulta->execute([
            intval($_GET["cliente_id"])
        ]);

        echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    if (isset($_GET["comercio_id"])) {

        $consulta = $conexion->prepare(
            "SELECT * FROM pedido
             WHERE id_comercio = ?
             ORDER BY fecha_pedido DESC"
        );

        $consulta->execute([
            intval($_GET["comercio_id"])
        ]);

        echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    $consulta = $conexion->query(
        "SELECT * FROM pedido
         ORDER BY fecha_pedido DESC"
    );

    echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Creamos un pedido
if ($metodo === "POST") {

    $datos = json_decode(file_get_contents("php://input"), true);

    try {

        $conexion->beginTransaction();

        $sql = "INSERT INTO pedido
                (id_cliente, id_comercio, estado)
                VALUES (?, ?, ?)";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $datos["id_cliente"],
            $datos["id_comercio"],
            $datos["estado"] ?? "Pendiente"
        ]);

        $idPedido = $conexion->lastInsertId();

        if (isset($datos["productos"])) {

            foreach ($datos["productos"] as $producto) {

                // Consultamos el producto
                $consulta = $conexion->prepare(
                    "SELECT precio, stock
                     FROM producto
                     WHERE id_producto = ?
                     AND id_comercio = ?"
                );

                $consulta->execute([
                    $producto["id_producto"],
                    $datos["id_comercio"]
                ]);

                $productoBD = $consulta->fetch(PDO::FETCH_ASSOC);

                if (!$productoBD) {
                    throw new Exception("Producto no encontrado");
                }

                if ($productoBD["stock"] < $producto["cantidad"]) {
                    throw new Exception("Stock insuficiente");
                }

                $precio = $producto["precio_unitario"]
                    ?? $productoBD["precio"];

                // Guardamos el producto del pedido
                $consulta = $conexion->prepare(
                    "INSERT INTO pedido_producto
                    (id_pedido, id_producto, cantidad, precio_unitario)
                    VALUES (?, ?, ?, ?)"
                );

                $consulta->execute([
                    $idPedido,
                    $producto["id_producto"],
                    $producto["cantidad"],
                    $precio
                ]);

                // Actualizamos el stock
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
        }

        $conexion->commit();

        echo json_encode([
            "mensaje" => "Pedido creado correctamente",
            "id" => $idPedido
        ]);

    } catch (Exception $e) {

        $conexion->rollBack();

        http_response_code(400);

        echo json_encode([
            "error" => $e->getMessage()
        ]);
    }

    exit;
}

// Actualizamos el estado del pedido
if ($metodo === "PUT") {

    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id"]);
        exit;
    }

    $id = intval($_GET["id"]);
    $datos = json_decode(file_get_contents("php://input"), true);

    if (!isset($datos["estado"])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el estado"]);
        exit;
    }

    $estado = $datos["estado"];

    if ($estado === "Listo para retirar") {

        $codigo = "TT-" . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));

        $sql = "UPDATE pedido
                SET estado = ?,
                    codigo_retiro = COALESCE(codigo_retiro, ?),
                    fecha_listo = NOW(),
                    vence_retiro = DATE_ADD(NOW(), INTERVAL 48 HOUR)
                WHERE id_pedido = ?";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $estado,
            $codigo,
            $id
        ]);

    } else {

        $sql = "UPDATE pedido
                SET estado = ?,
                    motivo_cancelacion = ?
                WHERE id_pedido = ?";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $estado,
            $datos["motivo_cancelacion"] ?? null,
            $id
        ]);
    }

    echo json_encode([
        "mensaje" => "Pedido actualizado correctamente"
    ]);

    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);

?>