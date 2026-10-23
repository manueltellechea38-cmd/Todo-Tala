<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

/*
Solo un jefe puede administrar empleados.
El comercio se obtiene desde la sesion del jefe.
*/
$usuario = requerirRol($conexion, ["jefe"]);

$sql = "SELECT id_comercio
        FROM comercio
        WHERE id_jefe = ?";

$consulta = $conexion->prepare($sql);
$consulta->execute([$usuario["id_persona"]]);

$comercio = $consulta->fetch(PDO::FETCH_ASSOC);

if (!$comercio) {
    responder(404, [
        "error" => "No se encontro el comercio del jefe"
    ]);
}

$idComercio = (int) $comercio["id_comercio"];
$metodo = $_SERVER["REQUEST_METHOD"];

/*
LISTAR EMPLEADOS DEL PROPIO COMERCIO
*/
if ($metodo === "GET") {

    $sql = "SELECT
                u.id_persona,
                u.nombre,
                u.cedula,
                u.correo,
                u.fecha_nacimiento,
                u.activo
            FROM empleado e
            INNER JOIN usuario u
                ON u.id_persona = e.id_persona
            WHERE e.id_comercio = ?
              AND u.activo = 1
            ORDER BY u.nombre";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$idComercio]);

    responder(200, $consulta->fetchAll(PDO::FETCH_ASSOC));
}

/*
CREAR EMPLEADO
*/
if ($metodo === "POST") {

    $datos = leerJson();

    $nombre = isset($datos["nombre"]) && is_string($datos["nombre"])
        ? trim($datos["nombre"])
        : "";

    $cedula = isset($datos["cedula"]) && is_string($datos["cedula"])
        ? preg_replace("/\D/", "", $datos["cedula"])
        : "";

    $correo = isset($datos["correo"]) && is_string($datos["correo"])
        ? strtolower(trim($datos["correo"]))
        : "";

    $password = isset($datos["password"]) && is_string($datos["password"])
        ? $datos["password"]
        : "";

    $fechaNacimiento =
        isset($datos["fecha_nacimiento"]) &&
        is_string($datos["fecha_nacimiento"]) &&
        $datos["fecha_nacimiento"] !== ""
            ? $datos["fecha_nacimiento"]
            : null;

    if (
        $nombre === "" ||
        $cedula === "" ||
        $correo === "" ||
        $password === ""
    ) {
        responder(400, [
            "error" => "Faltan datos obligatorios"
        ]);
    }

    if (strlen($cedula) < 7) {
        responder(400, [
            "error" => "La cedula no es valida"
        ]);
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        responder(400, [
            "error" => "El correo no es valido"
        ]);
    }

    if (strlen($password) < 8) {
        responder(400, [
            "error" => "La contrasena debe tener al menos 8 caracteres"
        ]);
    }

    /*
    Verificamos correo y cedula antes de insertar.
    */
    $sql = "SELECT id_persona
            FROM usuario
            WHERE correo = ?
               OR cedula = ?";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $correo,
        $cedula
    ]);

    if ($consulta->fetch()) {
        responder(409, [
            "error" => "Ese correo o cedula ya esta registrado"
        ]);
    }

    try {

        $conexion->beginTransaction();

        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $sql = "INSERT INTO usuario
                (
                    nombre,
                    cedula,
                    correo,
                    password_hash,
                    rol,
                    fecha_nacimiento
                )
                VALUES (?, ?, ?, ?, 'empleado', ?)";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $nombre,
            $cedula,
            $correo,
            $passwordHash,
            $fechaNacimiento
        ]);

        $idPersona = (int) $conexion->lastInsertId();

        $sql = "INSERT INTO empleado
                (id_persona, id_comercio)
                VALUES (?, ?)";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $idPersona,
            $idComercio
        ]);

        $conexion->commit();

        responder(201, [
            "mensaje" => "Empleado creado correctamente",
            "empleado" => [
                "id_persona" => $idPersona,
                "nombre" => $nombre,
                "correo" => $correo
            ]
        ]);

    } catch (PDOException $e) {

        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }

        if ($e->getCode() === "23000") {
            responder(409, [
                "error" => "Ese correo o cedula ya esta registrado"
            ]);
        }

        responder(500, [
            "error" => "Error interno del servidor"
        ]);
    }
}

/*
DESACTIVAR EMPLEADO
*/
if ($metodo === "DELETE") {

    if (!isset($_GET["id"])) {
        responder(400, [
            "error" => "Falta el id del empleado"
        ]);
    }

    $idEmpleado = intval($_GET["id"]);

    /*
    Comprobamos que realmente pertenezca
    al comercio del jefe autenticado.
    */
    $sql = "SELECT e.id_persona
            FROM empleado e
            INNER JOIN usuario u
                ON u.id_persona = e.id_persona
            WHERE e.id_persona = ?
              AND e.id_comercio = ?
              AND u.activo = 1";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $idEmpleado,
        $idComercio
    ]);

    if (!$consulta->fetch()) {
        responder(404, [
            "error" => "Empleado no encontrado"
        ]);
    }

    try {

        $conexion->beginTransaction();

        /*
        Lo desactivamos en vez de borrar fisicamente
        al usuario. Asi no rompemos relaciones futuras.
        */
        $sql = "UPDATE usuario
                SET activo = 0
                WHERE id_persona = ?";

        $consulta = $conexion->prepare($sql);
        $consulta->execute([$idEmpleado]);

        /*
        Cerramos cualquier sesion que tenga abierta.
        */
        $sql = "DELETE FROM sesiones
                WHERE id_persona = ?";

        $consulta = $conexion->prepare($sql);
        $consulta->execute([$idEmpleado]);

        $conexion->commit();

        responder(200, [
            "mensaje" => "Empleado eliminado correctamente"
        ]);

    } catch (PDOException $e) {

        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }

        responder(500, [
            "error" => "Error interno del servidor"
        ]);
    }
}

responder(405, [
    "error" => "Metodo no permitido"
]);