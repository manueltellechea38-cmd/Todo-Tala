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

// GET
if ($metodo === "GET") {

    if (isset($_GET["id"])) {
        $id = intval($_GET["id"]);

        $sql = "SELECT id_persona, nombre, cedula, correo, fecha_nacimiento, fecha_registro, activo
                FROM usuario
                WHERE id_persona = ?";

        $consulta = $conexion->prepare($sql);
        $consulta->execute([$id]);

        echo json_encode($consulta->fetch(PDO::FETCH_ASSOC));
        exit;
    }

    $sql = "SELECT id_persona, nombre, cedula, correo, fecha_nacimiento, fecha_registro, activo
            FROM usuario";

    $consulta = $conexion->query($sql);

    echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST
if ($metodo === "POST") {

    $datos = json_decode(file_get_contents("php://input"), true);

    $sql = "INSERT INTO usuario
            (nombre, cedula, correo, `contraseña`, fecha_nacimiento)
            VALUES (?, ?, ?, ?, ?)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $datos["nombre"],
        $datos["cedula"],
        $datos["correo"],
        $datos["contraseña"],
        $datos["fecha_nacimiento"] ?? null
    ]);

    echo json_encode([
        "mensaje" => "Usuario creado correctamente",
        "id" => $conexion->lastInsertId()
    ]);

    exit;
}

// PUT
if ($metodo === "PUT") {

    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id"]);
        exit;
    }

    $id = intval($_GET["id"]);
    $datos = json_decode(file_get_contents("php://input"), true);

    $sql = "UPDATE usuario
            SET nombre = ?,
                correo = ?,
                fecha_nacimiento = ?,
                activo = ?
            WHERE id_persona = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $datos["nombre"],
        $datos["correo"],
        $datos["fecha_nacimiento"] ?? null,
        $datos["activo"] ?? true,
        $id
    ]);

    echo json_encode([
        "mensaje" => "Usuario actualizado correctamente"
    ]);

    exit;
}

// DELETE
if ($metodo === "DELETE") {

    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id"]);
        exit;
    }

    $id = intval($_GET["id"]);

    $sql = "DELETE FROM usuario WHERE id_persona = ?";
    $consulta = $conexion->prepare($sql);
    $consulta->execute([$id]);

    echo json_encode([
        "mensaje" => "Usuario eliminado correctamente"
    ]);

    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);

?>