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

// Traemos los empleados
if ($metodo === "GET") {

    $sql = "SELECT
                u.id_persona,
                u.nombre,
                u.cedula,
                u.correo,
                u.fecha_nacimiento,
                u.activo,
                e.id_comercio
            FROM empleado e
            INNER JOIN usuario u
            ON e.id_persona = u.id_persona";

    if (isset($_GET["id"])) {

        $sql .= " WHERE u.id_persona = ?";

        $consulta = $conexion->prepare($sql);
        $consulta->execute([intval($_GET["id"])]);

        echo json_encode($consulta->fetch(PDO::FETCH_ASSOC));
        exit;
    }

    if (isset($_GET["comercio_id"])) {

        $sql .= " WHERE e.id_comercio = ?";

        $consulta = $conexion->prepare($sql);
        $consulta->execute([intval($_GET["comercio_id"])]);

        echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    $consulta = $conexion->query($sql);

    echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Creamos un empleado
if ($metodo === "POST") {

    $datos = json_decode(file_get_contents("php://input"), true);

    try {

        $conexion->beginTransaction();

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

        $id = $conexion->lastInsertId();

        $consulta = $conexion->prepare(
            "INSERT INTO empleado
            (id_persona, id_comercio)
            VALUES (?, ?)"
        );

        $consulta->execute([
            $id,
            $datos["id_comercio"]
        ]);

        $conexion->commit();

        echo json_encode([
            "mensaje" => "Empleado creado correctamente",
            "id" => $id
        ]);

    } catch (Exception $e) {

        $conexion->rollBack();

        http_response_code(400);

        echo json_encode([
            "error" => "No se pudo crear el empleado"
        ]);
    }

    exit;
}

// Actualizamos un empleado
if ($metodo === "PUT") {

    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id"]);
        exit;
    }

    $id = intval($_GET["id"]);
    $datos = json_decode(file_get_contents("php://input"), true);

    $consulta = $conexion->prepare(
        "SELECT u.*, e.id_comercio
         FROM usuario u
         INNER JOIN empleado e
         ON u.id_persona = e.id_persona
         WHERE u.id_persona = ?"
    );

    $consulta->execute([$id]);
    $actual = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$actual) {
        http_response_code(404);
        echo json_encode(["error" => "Empleado no encontrado"]);
        exit;
    }

    $conexion->beginTransaction();

    $consulta = $conexion->prepare(
        "UPDATE usuario
         SET nombre = ?,
             correo = ?,
             fecha_nacimiento = ?,
             activo = ?
         WHERE id_persona = ?"
    );

    $consulta->execute([
        $datos["nombre"] ?? $actual["nombre"],
        $datos["correo"] ?? $actual["correo"],
        $datos["fecha_nacimiento"] ?? $actual["fecha_nacimiento"],
        $datos["activo"] ?? $actual["activo"],
        $id
    ]);

    $consulta = $conexion->prepare(
        "UPDATE empleado
         SET id_comercio = ?
         WHERE id_persona = ?"
    );

    $consulta->execute([
        $datos["id_comercio"] ?? $actual["id_comercio"],
        $id
    ]);

    $conexion->commit();

    echo json_encode([
        "mensaje" => "Empleado actualizado correctamente"
    ]);

    exit;
}

// Eliminamos un empleado
if ($metodo === "DELETE") {

    if (!isset($_GET["id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id"]);
        exit;
    }

    $id = intval($_GET["id"]);

    try {

        $conexion->beginTransaction();

        $consulta = $conexion->prepare(
            "DELETE FROM empleado WHERE id_persona = ?"
        );

        $consulta->execute([$id]);

        $consulta = $conexion->prepare(
            "DELETE FROM usuario WHERE id_persona = ?"
        );

        $consulta->execute([$id]);

        $conexion->commit();

        echo json_encode([
            "mensaje" => "Empleado eliminado correctamente"
        ]);

    } catch (Exception $e) {

        $conexion->rollBack();

        http_response_code(400);

        echo json_encode([
            "error" => "No se pudo eliminar el empleado"
        ]);
    }

    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);

?>