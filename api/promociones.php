<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once "conexion.php";

$metodo = $_SERVER["REQUEST_METHOD"];

// Traemos las promociones
if ($metodo === "GET") {

    if (isset($_GET["id"])) {

        $consulta = $conexion->prepare(
            "SELECT * FROM promocion
             WHERE id_promocion = ?"
        );

        $consulta->execute([
            intval($_GET["id"])
        ]);

        echo json_encode($consulta->fetch(PDO::FETCH_ASSOC));
        exit;
    }

    if (isset($_GET["comercio_id"])) {

        $sql = "SELECT pr.*
                FROM promocion pr
                INNER JOIN producto p
                ON pr.id_producto = p.id_producto
                WHERE p.id_comercio = ?";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            intval($_GET["comercio_id"])
        ]);

        echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    $consulta = $conexion->query(
        "SELECT * FROM promocion"
    );

    echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Creamos una promoción
if ($metodo === "POST") {

    $datos = json_decode(file_get_contents("php://input"), true);

    $sql = "INSERT INTO promocion
            (id_producto, tipo, valor, fecha_inicio, fecha_fin, estado)
            VALUES (?, ?, ?, ?, ?, ?)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $datos["id_producto"],
        $datos["tipo"],
        $datos["valor"],
        $datos["fecha_inicio"] ?? null,
        $datos["fecha_fin"] ?? null,
        $datos["estado"]
    ]);

    echo json_encode([
        "mensaje" => "Promoción creada correctamente",
        "id" => $conexion->lastInsertId()
    ]);

    exit;
}

// Actualizamos una promoción
if ($metodo === "PUT") {

    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id"]);
        exit;
    }

    $id = intval($_GET["id"]);
    $datos = json_decode(file_get_contents("php://input"), true);

    $consulta = $conexion->prepare(
        "SELECT * FROM promocion
         WHERE id_promocion = ?"
    );

    $consulta->execute([$id]);
    $actual = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$actual) {
        http_response_code(404);
        echo json_encode(["error" => "Promoción no encontrada"]);
        exit;
    }

    $sql = "UPDATE promocion
            SET id_producto = ?,
                tipo = ?,
                valor = ?,
                fecha_inicio = ?,
                fecha_fin = ?,
                estado = ?
            WHERE id_promocion = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $datos["id_producto"] ?? $actual["id_producto"],
        $datos["tipo"] ?? $actual["tipo"],
        $datos["valor"] ?? $actual["valor"],
        $datos["fecha_inicio"] ?? $actual["fecha_inicio"],
        $datos["fecha_fin"] ?? $actual["fecha_fin"],
        $datos["estado"] ?? $actual["estado"],
        $id
    ]);

    echo json_encode([
        "mensaje" => "Promoción actualizada correctamente"
    ]);

    exit;
}

// Eliminamos una promoción
if ($metodo === "DELETE") {

    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id"]);
        exit;
    }

    $consulta = $conexion->prepare(
        "DELETE FROM promocion
         WHERE id_promocion = ?"
    );

    $consulta->execute([
        intval($_GET["id"])
    ]);

    echo json_encode([
        "mensaje" => "Promoción eliminada correctamente"
    ]);

    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);

?>