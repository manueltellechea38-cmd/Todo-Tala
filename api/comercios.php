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

// Traemos los datos
if ($metodo === "GET") {

    if (isset($_GET["id"])) {
        $id = intval($_GET["id"]);

        $consulta = $conexion->prepare(
            "SELECT * FROM comercio WHERE id_comercio = ?"
        );

        $consulta->execute([$id]);

        echo json_encode($consulta->fetch(PDO::FETCH_ASSOC));
        exit;
    }

    $consulta = $conexion->query("SELECT * FROM comercio");

    echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Creamos un comercio
if ($metodo === "POST") {

    $datos = json_decode(file_get_contents("php://input"), true);

    $sql = "INSERT INTO comercio
            (id_jefe, nombre, ruc, telefono, direccion, horario)
            VALUES (?, ?, ?, ?, ?, ?)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $datos["id_jefe"],
        $datos["nombre"],
        $datos["ruc"],
        $datos["telefono"] ?? null,
        $datos["direccion"] ?? null,
        $datos["horario"] ?? null
    ]);

    echo json_encode([
        "mensaje" => "Comercio creado correctamente",
        "id" => $conexion->lastInsertId()
    ]);

    exit;
}

// Actualizamos un comercio
if ($metodo === "PUT") {

    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id"]);
        exit;
    }

    $id = intval($_GET["id"]);
    $datos = json_decode(file_get_contents("php://input"), true);

    $consulta = $conexion->prepare(
        "SELECT * FROM comercio WHERE id_comercio = ?"
    );

    $consulta->execute([$id]);
    $actual = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$actual) {
        http_response_code(404);
        echo json_encode(["error" => "Comercio no encontrado"]);
        exit;
    }

    $sql = "UPDATE comercio
            SET nombre = ?,
                ruc = ?,
                telefono = ?,
                direccion = ?,
                horario = ?
            WHERE id_comercio = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $datos["nombre"] ?? $actual["nombre"],
        $datos["ruc"] ?? $actual["ruc"],
        $datos["telefono"] ?? $actual["telefono"],
        $datos["direccion"] ?? $actual["direccion"],
        $datos["horario"] ?? $actual["horario"],
        $id
    ]);

    echo json_encode([
        "mensaje" => "Comercio actualizado correctamente"
    ]);

    exit;
}

// Eliminamos un comercio
if ($metodo === "DELETE") {

    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id"]);
        exit;
    }

    $id = intval($_GET["id"]);

    $consulta = $conexion->prepare(
        "DELETE FROM comercio WHERE id_comercio = ?"
    );

    $consulta->execute([$id]);

    echo json_encode([
        "mensaje" => "Comercio eliminado correctamente"
    ]);

    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);

?>