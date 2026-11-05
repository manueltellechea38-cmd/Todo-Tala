<?php
require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

$usuario = requerirRol($conexion, ["jefe"]);

$consulta = $conexion->prepare(
    "SELECT id_comercio FROM comercio WHERE id_jefe = ?"
);
$consulta->execute([$usuario["id_persona"]]);

$idComercio = $consulta->fetchColumn();

if (!$idComercio) {
    responder(404, ["error" => "No se encontro el comercio del jefe"]);
}

$idComercio = (int)$idComercio;
$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "GET") {
    $consulta = $conexion->prepare(
        "SELECT u.id_persona, u.nombre, u.cedula,
                u.correo, u.fecha_nacimiento, u.activo
         FROM empleado e
         INNER JOIN usuario u ON u.id_persona = e.id_persona
         WHERE e.id_comercio = ? AND u.activo = 1
         ORDER BY u.nombre"
    );
    $consulta->execute([$idComercio]);
    responder(200, $consulta->fetchAll(PDO::FETCH_ASSOC));
}

if ($metodo === "POST") {
    $datos = leerJson();

    $nombre = trim((string)($datos["nombre"] ?? ""));
    $cedula = preg_replace("/\D/", "", (string)($datos["cedula"] ?? ""));
    $correo = strtolower(trim((string)($datos["correo"] ?? "")));
    $password = (string)($datos["password"] ?? "");
    $fecha = $datos["fecha_nacimiento"] ?? null;

    if ($fecha === "") $fecha = null;

    if ($nombre === "" || strlen($cedula) < 7 ||
        !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        responder(400, ["error" => "Nombre, cedula o correo no validos"]);
    }

    try {
        $conexion->beginTransaction();

        $consulta = $conexion->prepare(
            "SELECT id_persona, cedula, correo, activo
             FROM usuario
             WHERE cedula = ? OR correo = ?
             FOR UPDATE"
        );
        $consulta->execute([$cedula, $correo]);
        $existentes = $consulta->fetchAll(PDO::FETCH_ASSOC);

        if (count($existentes) > 1) {
            $conexion->rollBack();
            responder(409, [
                "error" => "La cedula y el correo corresponden a cuentas diferentes"
            ]);
        }

        if (count($existentes) === 1) {
            $existente = $existentes[0];

            if (
                $existente["cedula"] !== $cedula ||
                strtolower($existente["correo"]) !== $correo
            ) {
                $conexion->rollBack();
                responder(409, [
                    "error" => "La cedula y el correo deben coincidir con la cuenta existente"
                ]);
            }

            if (!(int)$existente["activo"]) {
                $conexion->rollBack();
                responder(403, ["error" => "La cuenta esta desactivada"]);
            }

            $idPersona = (int)$existente["id_persona"];
            $mensaje = "Empleado vinculado a su cuenta existente";

        } else {
            if (strlen($password) < 8) {
                $conexion->rollBack();
                responder(400, [
                    "error" => "La persona no tiene cuenta. Debe registrarse o indicar una contraseña de al menos 8 caracteres"
                ]);
            }

            $consulta = $conexion->prepare(
                "INSERT INTO usuario
                 (nombre, cedula, correo, password_hash, rol, fecha_nacimiento)
                 VALUES (?, ?, ?, ?, 'empleado', ?)"
            );
            $consulta->execute([
                $nombre,
                $cedula,
                $correo,
                password_hash($password, PASSWORD_DEFAULT),
                $fecha
            ]);

            $idPersona = (int)$conexion->lastInsertId();

            $consulta = $conexion->prepare(
                "INSERT INTO cliente (id_persona) VALUES (?)"
            );
            $consulta->execute([$idPersona]);

            $mensaje = "Empleado y cuenta creados correctamente";
        }

        $consulta = $conexion->prepare(
            "SELECT id_comercio FROM empleado WHERE id_persona = ?"
        );
        $consulta->execute([$idPersona]);

        $vinculo = $consulta->fetchColumn();

        if ($vinculo !== false) {
            $conexion->rollBack();
            responder(409, [
                "error" => ((int)$vinculo === $idComercio)
                    ? "La persona ya trabaja en este comercio"
                    : "La persona ya esta vinculada como empleado a otro comercio"
            ]);
        }

        $consulta = $conexion->prepare(
            "INSERT INTO empleado (id_persona, id_comercio)
             VALUES (?, ?)"
        );
        $consulta->execute([$idPersona, $idComercio]);

        $conexion->commit();

        responder(201, [
            "mensaje" => $mensaje,
            "empleado" => [
                "id_persona" => $idPersona,
                "correo" => $correo
            ]
        ]);

    } catch (Throwable $e) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }

        if ($e instanceof PDOException && $e->getCode() === "23000") {
            responder(409, ["error" => "Registro duplicado"]);
        }

        responder(500, ["error" => "No se pudo registrar el empleado"]);
    }
}

if ($metodo === "DELETE") {
    $idPersona = (int)($_GET["id"] ?? 0);

    if ($idPersona <= 0) {
        responder(400, ["error" => "Falta identificar al empleado"]);
    }

    try {
        $conexion->beginTransaction();

        $consulta = $conexion->prepare(
            "DELETE FROM empleado
             WHERE id_persona = ? AND id_comercio = ?"
        );
        $consulta->execute([$idPersona, $idComercio]);

        if ($consulta->rowCount() === 0) {
            $conexion->rollBack();
            responder(404, ["error" => "Empleado no encontrado"]);
        }

        $consulta = $conexion->prepare(
            "DELETE FROM sesiones
             WHERE id_persona = ? AND rol_activo = 'empleado'"
        );
        $consulta->execute([$idPersona]);

        $conexion->commit();

        responder(200, [
            "mensaje" => "Empleado desvinculado. Su cuenta personal sigue activa"
        ]);

    } catch (Throwable $e) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }

        responder(500, ["error" => "No se pudo desvincular al empleado"]);
    }
}

responder(405, ["error" => "Metodo no permitido"]);