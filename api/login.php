<?php

require_once "comun.php";
require_once "conexion.php";
require_once "seguridad.php";

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

/*
Si el correo no existe igualmente comprobamos una contraseña contra un hash.
De esta forma la respuesta no revela fácilmente si un correo existe o no.
*/
const HASH_RELLENO = '$2y$12$SjYx1dXlbdYBVC6cn7K.d.wh.QBxs2B/nLsXXtynvX5I0O.ZHjf5W';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(405, [
        "error" => "Método no permitido"
    ]);
}

try {

    $datos = leerJson();

    $correo = isset($datos["email"]) && is_string($datos["email"])
        ? strtolower(trim($datos["email"]))
        : "";

    $password = isset($datos["password"]) && is_string($datos["password"])
        ? $datos["password"]
        : "";

    if ($correo === "" || $password === "") {
        responder(400, [
            "error" => "Correo y contraseña son obligatorios"
        ]);
    }

    $sql = "SELECT
                id_persona,
                nombre,
                correo,
                password_hash,
                rol,
                intentos_fallidos,
                bloqueado_hasta,
                activo
            FROM usuario
            WHERE correo = ?";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$correo]);

    $usuario = $consulta->fetch(PDO::FETCH_ASSOC);

    /*
    Usamos el mismo mensaje si el correo no existe o la contraseña es incorrecta.
    */
    if (!$usuario) {
        password_verify($password, HASH_RELLENO);

        responder(401, [
            "error" => "Correo o contraseña incorrectos"
        ]);
    }

    if (!$usuario["activo"]) {
        responder(403, [
            "error" => "La cuenta está desactivada"
        ]);
    }

    $ahora = date("Y-m-d H:i:s");

    /*
    Si la cuenta está bloqueada temporalmente, no permitimos iniciar sesión.
    */
    if (
        $usuario["bloqueado_hasta"] !== null &&
        $usuario["bloqueado_hasta"] > $ahora
    ) {
        responder(429, [
            "error" => "Demasiados intentos fallidos. Probá de nuevo en unos minutos"
        ]);
    }

    /*
    Contraseña incorrecta.
    */
    if (!password_verify($password, $usuario["password_hash"])) {

        $intentos = $usuario["intentos_fallidos"] + 1;

        if ($intentos >= MAX_INTENTOS) {

            $hasta = date(
                "Y-m-d H:i:s",
                time() + MINUTOS_BLOQUEO * 60
            );

            $sql = "UPDATE usuario
                    SET intentos_fallidos = 0,
                        bloqueado_hasta = ?
                    WHERE id_persona = ?";

            $consulta = $conexion->prepare($sql);

            $consulta->execute([
                $hasta,
                $usuario["id_persona"]
            ]);

        } else {

            $sql = "UPDATE usuario
                    SET intentos_fallidos = ?
                    WHERE id_persona = ?";

            $consulta = $conexion->prepare($sql);

            $consulta->execute([
                $intentos,
                $usuario["id_persona"]
            ]);
        }

        responder(401, [
            "error" => "Correo o contraseña incorrectos"
        ]);
    }

    /*
    Si PHP cambia el algoritmo recomendado, actualizamos el hash.
    */
    if (
        password_needs_rehash(
            $usuario["password_hash"],
            PASSWORD_DEFAULT
        )
    ) {
        $nuevoHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $sql = "UPDATE usuario
                SET password_hash = ?
                WHERE id_persona = ?";

        $consulta = $conexion->prepare($sql);

        $consulta->execute([
            $nuevoHash,
            $usuario["id_persona"]
        ]);
    }

    /*
    Si la contraseña fue correcta, reiniciamos los intentos fallidos.
    */
    $sql = "UPDATE usuario
            SET intentos_fallidos = 0,
                bloqueado_hasta = NULL
            WHERE id_persona = ?";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$usuario["id_persona"]]);

    /*
    Eliminamos sesiones que ya vencieron.
    */
    $sql = "DELETE FROM sesiones
            WHERE expira_en < ?";

    $consulta = $conexion->prepare($sql);
    $consulta->execute([$ahora]);

    /*
    Creamos una nueva sesión y obtenemos el token.
    */
    $token = crearSesion(
        $conexion,
        $usuario["id_persona"]
    );

    responder(200, [
        "mensaje" => "Sesión iniciada",
        "token" => $token,
        "expira_en" => DURACION_SESION,
        "usuario" => [
            "id_persona" => (int) $usuario["id_persona"],
            "nombre" => $usuario["nombre"],
            "correo" => $usuario["correo"],
            "rol" => $usuario["rol"]
        ]
    ]);

} catch (PDOException $e) {

    responder(500, [
        "error" => "Error interno del servidor"
    ]);
}