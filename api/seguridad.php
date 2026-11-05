<?php

const DURACION_SESION = 7200; // 2 horas

const ROLES = ['cliente', 'empleado', 'jefe'];

/* Roles asociados a una misma persona. */
function rolesDisponibles($conexion, $idPersona) {
    $consulta = $conexion->prepare(
        "SELECT
            EXISTS(SELECT 1 FROM cliente WHERE id_persona = ?) AS cliente,
            EXISTS(SELECT 1 FROM comercio WHERE id_jefe = ?) AS jefe,
            EXISTS(SELECT 1 FROM empleado WHERE id_persona = ?) AS empleado"
    );
    $consulta->execute([$idPersona, $idPersona, $idPersona]);
    $fila = $consulta->fetch(PDO::FETCH_ASSOC);

    $roles = [];
    foreach (["cliente", "jefe", "empleado"] as $rol) {
        if ($fila && (int)$fila[$rol] === 1) {
            $roles[] = $rol;
        }
    }
    return $roles;
}

/* Lee el token enviado en Authorization: Bearer TOKEN */
function obtenerToken() {
    $cabecera = $_SERVER["HTTP_AUTHORIZATION"] ?? "";

    if (!preg_match('/^Bearer ([a-f0-9]{64})$/i', $cabecera, $coincidencias)) {
        return null;
    }

    return $coincidencias[1];
}

/* Convierte el token en un hash SHA-256 para guardarlo o buscarlo en la base. */
function hashToken($token) {
    return hash("sha256", $token);
}

/* Crea una sesión para el usuario y devuelve el token original. */
function crearSesion($conexion, $idPersona, $rolActivo) {
    if (!in_array($rolActivo, rolesDisponibles($conexion, $idPersona), true)) {
        throw new RuntimeException("Rol no autorizado");
    }
    $token = bin2hex(random_bytes(32));

    $expira = date(
        "Y-m-d H:i:s",
        time() + DURACION_SESION
    );

    $sql = "INSERT INTO sesiones
            (token_hash, id_persona, rol_activo, expira_en)
            VALUES (?, ?, ?, ?)";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        hashToken($token),
        $idPersona,
        $rolActivo,
        $expira
    ]);

    return $token;
}

/* Busca al usuario dueño del token. */
function usuarioActual($conexion) {
    $token = obtenerToken();

    if ($token === null) {
        return null;
    }

    $sql = "SELECT
                u.id_persona,
                u.nombre,
                u.correo,
                COALESCE(s.rol_activo, u.rol) AS rol
            FROM sesiones s
            INNER JOIN usuario u
                ON u.id_persona = s.id_persona
            WHERE s.token_hash = ?
              AND s.expira_en > ?
              AND u.activo = 1";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        hashToken($token),
        date("Y-m-d H:i:s")
    ]);

    $usuario = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) return null;

    if (!in_array(
        $usuario["rol"],
        rolesDisponibles($conexion, $usuario["id_persona"]),
        true
    )) {
        return null;
    }

    return $usuario;
}

/* Obliga a que exista una sesión válida. */
function requerirLogin($conexion) {
    $usuario = usuarioActual($conexion);

    if ($usuario === null) {
        header("WWW-Authenticate: Bearer");

        responder(401, [
            "error" => "Tenés que iniciar sesión"
        ]);
    }

    return $usuario;
}

/* Además del login, controla que el usuario tenga uno de los roles permitidos. */
function requerirRol($conexion, $rolesPermitidos) {
    $usuario = requerirLogin($conexion);

    if (!in_array($usuario["rol"], $rolesPermitidos, true)) {
        responder(403, [
            "error" => "No tenés permisos para realizar esta acción"
        ]);
    }

    return $usuario;
}