<?php
require_once __DIR__ . "/comun.php";
require_once __DIR__ . "/conexion.php";
require_once __DIR__ . "/seguridad.php";

function obtenerComercioCategoria($conexion, $usuario) {
    if ($usuario["rol"] === "jefe") {
        $consulta = $conexion->prepare(
            "SELECT id_comercio FROM comercio WHERE id_jefe = ?"
        );
    } else {
        $consulta = $conexion->prepare(
            "SELECT id_comercio FROM empleado WHERE id_persona = ?"
        );
    }

    $consulta->execute([$usuario["id_persona"]]);
    $comercio = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$comercio) {
        responder(404, ["error" => "No se encontro el comercio del usuario"]);
    }

    return (int) $comercio["id_comercio"];
}

$usuario = requerirRol($conexion, ["jefe", "empleado"]);
$idComercio = obtenerComercioCategoria($conexion, $usuario);
$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "GET") {
    $consulta = $conexion->prepare(
        "SELECT id_categoria, id_comercio, nombre, descripcion,
                CASE WHEN id_comercio IS NULL THEN 1 ELSE 0 END AS es_general
         FROM categoria
         WHERE id_comercio IS NULL OR id_comercio = ?
         ORDER BY nombre ASC, (id_comercio IS NOT NULL) ASC"
    );

    $consulta->execute([$idComercio]);
    responder(200, $consulta->fetchAll(PDO::FETCH_ASSOC));
}

if ($metodo === "POST") {
    $datos = leerJson();

    $nombre = isset($datos["nombre"])
        ? trim((string) $datos["nombre"])
        : "";

    $descripcion = isset($datos["descripcion"])
        ? trim((string) $datos["descripcion"])
        : null;

    if ($nombre === "" || mb_strlen($nombre) > 100 ||
        ($descripcion !== null && mb_strlen($descripcion) > 200)) {
        responder(400, ["error" => "El nombre o la descripcion no son validos"]);
    }

    try {
        $consulta = $conexion->prepare(
            "INSERT INTO categoria (id_comercio, nombre, descripcion)
             VALUES (?, ?, ?)"
        );
        $consulta->execute([$idComercio, $nombre, $descripcion]);

        responder(201, [
            "mensaje" => "Categoria creada correctamente",
            "id_categoria" => (int) $conexion->lastInsertId()
        ]);
    } catch (PDOException $error) {
        if ($error->getCode() === "23000") {
            responder(409, ["error" => "Ya existe una categoria con ese nombre"]);
        }
        responder(500, ["error" => "No se pudo crear la categoria"]);
    }
}

if ($metodo === "PUT") {
    $id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;

    if ($id <= 0) {
        responder(400, ["error" => "Falta un ID de categoria valido"]);
    }

    $datos = leerJson();
    $nombre = isset($datos["nombre"])
        ? trim((string) $datos["nombre"])
        : "";

    $descripcion = isset($datos["descripcion"])
        ? trim((string) $datos["descripcion"])
        : null;

    if ($nombre === "" || mb_strlen($nombre) > 100 ||
        ($descripcion !== null && mb_strlen($descripcion) > 200)) {
        responder(400, ["error" => "El nombre o la descripcion no son validos"]);
    }

    $consulta = $conexion->prepare(
        "SELECT id_categoria FROM categoria
         WHERE id_categoria = ? AND id_comercio = ?"
    );
    $consulta->execute([$id, $idComercio]);

    if (!$consulta->fetch()) {
        responder(404, ["error" => "La categoria no existe o no pertenece a tu comercio"]);
    }

    try {
        $consulta = $conexion->prepare(
            "UPDATE categoria
             SET nombre = ?, descripcion = ?
             WHERE id_categoria = ? AND id_comercio = ?"
        );
        $consulta->execute([$nombre, $descripcion, $id, $idComercio]);

        responder(200, ["mensaje" => "Categoria actualizada correctamente"]);
    } catch (PDOException $error) {
        if ($error->getCode() === "23000") {
            responder(409, ["error" => "Ya existe una categoria con ese nombre"]);
        }
        responder(500, ["error" => "No se pudo actualizar la categoria"]);
    }
}

if ($metodo === "DELETE") {
    $id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;

    if ($id <= 0) {
        responder(400, ["error" => "Falta un ID de categoria valido"]);
    }

    $consulta = $conexion->prepare(
        "SELECT id_categoria FROM categoria
         WHERE id_categoria = ? AND id_comercio = ?"
    );
    $consulta->execute([$id, $idComercio]);

    if (!$consulta->fetch()) {
        responder(404, ["error" => "La categoria no existe o no pertenece a tu comercio"]);
    }

    $consulta = $conexion->prepare(
        "SELECT COUNT(*) FROM producto WHERE id_categoria = ?"
    );
    $consulta->execute([$id]);

    if ((int) $consulta->fetchColumn() > 0) {
        responder(409, [
            "error" => "No se puede eliminar una categoria que tiene productos asociados. Reasigna primero esos productos."
        ]);
    }

    $consulta = $conexion->prepare(
        "DELETE FROM categoria
         WHERE id_categoria = ? AND id_comercio = ?"
    );
    $consulta->execute([$id, $idComercio]);

    responder(200, ["mensaje" => "Categoria eliminada correctamente"]);
}

header("Allow: GET, POST, PUT, DELETE, OPTIONS");
responder(405, ["error" => "Metodo no permitido"]);