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

        $sql = "SELECT * FROM producto WHERE id_producto = ?";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$id]);

        echo json_encode($consulta->fetch(PDO::FETCH_ASSOC));
        exit;
    }

    if (isset($_GET["nombre"])) {
        $nombre = "%" . $_GET["nombre"] . "%";

        $sql = "SELECT * FROM producto WHERE nombre LIKE ?";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$nombre]);

        echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    $orden = "id_producto";
    $direccion = "ASC";

    if (isset($_GET["orden"])) {
        if ($_GET["orden"] === "nombre") {
            $orden = "nombre";
        }

        if ($_GET["orden"] === "precio") {
            $orden = "precio";
        }
    }

    if (isset($_GET["direccion"]) && strtolower($_GET["direccion"]) === "desc") {
        $direccion = "DESC";
    }

    $sql = "SELECT * FROM producto ORDER BY $orden $direccion";
    $consulta = $conexion->query($sql);

    echo json_encode($consulta->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST
if ($metodo === "POST") {

    $datos = json_decode(file_get_contents("php://input"), true);

    $sql = "INSERT INTO producto
            (id_comercio, id_categoria, nombre, marca, precio, descripcion, stock, imagen, visible)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $datos["id_comercio"],
        $datos["id_categoria"],
        $datos["nombre"],
        $datos["marca"] ?? null,
        $datos["precio"],
        $datos["descripcion"] ?? null,
        $datos["stock"],
        $datos["imagen"] ?? null,
        $datos["visible"] ?? true
    ]);

    echo json_encode([
        "mensaje" => "Producto creado correctamente",
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

    $sql = "UPDATE producto
            SET id_comercio = ?,
                id_categoria = ?,
                nombre = ?,
                marca = ?,
                precio = ?,
                descripcion = ?,
                stock = ?,
                imagen = ?,
                visible = ?
            WHERE id_producto = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $datos["id_comercio"],
        $datos["id_categoria"],
        $datos["nombre"],
        $datos["marca"] ?? null,
        $datos["precio"],
        $datos["descripcion"] ?? null,
        $datos["stock"],
        $datos["imagen"] ?? null,
        $datos["visible"] ?? true,
        $id
    ]);

    echo json_encode([
        "mensaje" => "Producto actualizado correctamente"
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

    $sql = "DELETE FROM producto WHERE id_producto = ?";
    $consulta = $conexion->prepare($sql);
    $consulta->execute([$id]);

    echo json_encode([
        "mensaje" => "Producto eliminado correctamente"
    ]);

    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);

?>