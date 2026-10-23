<?php

require_once "comun.php";
require_once "conexion.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(405, [
        "error" => "Metodo no permitido"
    ]);
}

try {

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

    $rol = isset($datos["rol"]) && is_string($datos["rol"])
        ? $datos["rol"]
        : "";

    $fechaNacimiento =
        isset($datos["fecha_nacimiento"]) &&
        is_string($datos["fecha_nacimiento"]) &&
        $datos["fecha_nacimiento"] !== ""
            ? $datos["fecha_nacimiento"]
            : null;

    /*
    Validaciones generales.
    */
    if (
        $nombre === "" ||
        $cedula === "" ||
        $correo === "" ||
        $password === "" ||
        $rol === ""
    ) {
        responder(400, [
            "error" => "Faltan datos obligatorios"
        ]);
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        responder(400, [
            "error" => "El correo no es valido"
        ]);
    }

    if (strlen($cedula) < 7) {
        responder(400, [
            "error" => "La cedula no es valida"
        ]);
    }

    if (strlen($password) < 8) {
        responder(400, [
            "error" => "La contrasena debe tener al menos 8 caracteres"
        ]);
    }

    if (!in_array($rol, ["cliente", "jefe"], true)) {
        responder(400, [
            "error" => "Tipo de cuenta no valido"
        ]);
    }

    /*
    Comprobamos que el correo no exista.
    */
    $sql = "SELECT id_persona
            FROM usuario
            WHERE correo = ?";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$correo]);

    if ($consulta->fetch()) {
        responder(409, [
            "error" => "Ese correo ya esta registrado"
        ]);
    }

    /*
    Comprobamos que la cedula no exista.
    */
    $sql = "SELECT id_persona
            FROM usuario
            WHERE cedula = ?";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$cedula]);

    if ($consulta->fetch()) {
        responder(409, [
            "error" => "Esa cedula ya esta registrada"
        ]);
    }

    /*
    Si es jefe, validamos primero los datos del comercio.
    */
    $comercio = null;

    if ($rol === "jefe") {

        if (
            !isset($datos["comercio"]) ||
            !is_array($datos["comercio"])
        ) {
            responder(400, [
                "error" => "Faltan los datos del comercio"
            ]);
        }

        $comercio = $datos["comercio"];

        $nombreComercio =
            isset($comercio["nombre"]) && is_string($comercio["nombre"])
                ? trim($comercio["nombre"])
                : "";

        $ruc =
            isset($comercio["ruc"]) && is_string($comercio["ruc"])
                ? preg_replace("/\D/", "", $comercio["ruc"])
                : "";

        $telefono =
            isset($comercio["telefono"]) && is_string($comercio["telefono"])
                ? trim($comercio["telefono"])
                : "";

        $direccion =
            isset($comercio["direccion"]) && is_string($comercio["direccion"])
                ? trim($comercio["direccion"])
                : "";

        $horario =
            isset($comercio["horario"]) && is_string($comercio["horario"])
                ? trim($comercio["horario"])
                : "";

        if (
            $nombreComercio === "" ||
            strlen($ruc) < 10 ||
            $telefono === "" ||
            $direccion === "" ||
            $horario === ""
        ) {
            responder(400, [
                "error" => "Los datos del comercio no son validos"
            ]);
        }

        /*
        Comprobamos que el RUC no exista.
        */
        $sql = "SELECT id_comercio
                FROM comercio
                WHERE ruc = ?";

        $consulta = $conexion->prepare($sql);
        $consulta->execute([$ruc]);

        if ($consulta->fetch()) {
            responder(409, [
                "error" => "Ese RUC ya esta registrado"
            ]);
        }
    }

    /*
    A partir de aca usamos una transaccion.
    Si falla alguna parte, no queda un registro incompleto.
    */
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
            VALUES (?, ?, ?, ?, ?, ?)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        $nombre,
        $cedula,
        $correo,
        $passwordHash,
        $rol,
        $fechaNacimiento
    ]);

    $idPersona = (int) $conexion->lastInsertId();

    /*
    Creamos la fila correspondiente al tipo de usuario.
    */
    if ($rol === "cliente") {

        $sql = "INSERT INTO cliente (id_persona)
                VALUES (?)";

        $consulta = $conexion->prepare($sql);
        $consulta->execute([$idPersona]);

    } else {

        $sql = "INSERT INTO jefe (id_persona)
                VALUES (?)";

        $consulta = $conexion->prepare($sql);
        $consulta->execute([$idPersona]);

        $sql = "INSERT INTO comercio
                (
                    id_jefe,
                    nombre,
                    ruc,
                    telefono,
                    direccion,
                    horario
                )
                VALUES (?, ?, ?, ?, ?, ?)";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $idPersona,
            $nombreComercio,
            $ruc,
            $telefono,
            $direccion,
            $horario
        ]);
    }

    $conexion->commit();

    responder(201, [
        "mensaje" => "Cuenta creada correctamente",
        "usuario" => [
            "id_persona" => $idPersona,
            "nombre" => $nombre,
            "correo" => $correo,
            "rol" => $rol
        ]
    ]);

} catch (PDOException $e) {

    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }

    /*
    23000 corresponde, entre otros casos,
    a valores UNIQUE duplicados.
    */
    if ($e->getCode() === "23000") {
        responder(409, [
            "error" => "Ya existe un registro con esos datos"
        ]);
    }

    responder(500, [
        "error" => "Error interno del servidor"
    ]);
}