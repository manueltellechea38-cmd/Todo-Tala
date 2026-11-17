<?php

require_once __DIR__ . "/comun.php";
require_once __DIR__ . "/conexion.php";
require_once __DIR__ . "/seguridad.php";

$usuario = requerirLogin($conexion);
$idPersona = (int) $usuario["id_persona"];
$metodo = $_SERVER["REQUEST_METHOD"];

/* Convierte valores recibidos en booleanos válidos. */
function convertirBooleano($valor) {
    if ($valor === true || $valor === 1 || $valor === "1") {
        return true;
    }

    if ($valor === false || $valor === 0 || $valor === "0") {
        return false;
    }

    return null;
}

/* GET: historial, contador y preferencias. */
if ($metodo === "GET") {

    $consulta = $conexion->prepare(
        "SELECT
            id_notificacion,
            mensaje,
            tipo,
            fecha,
            leida
         FROM notificacion
         WHERE id_persona = ?
         ORDER BY fecha DESC, id_notificacion DESC
         LIMIT 100"
    );

    $consulta->execute([$idPersona]);
    $notificaciones = $consulta->fetchAll(PDO::FETCH_ASSOC);

    $consulta = $conexion->prepare(
        "SELECT COUNT(*)
         FROM notificacion
         WHERE id_persona = ?
           AND leida = 0"
    );

    $consulta->execute([$idPersona]);
    $sinLeer = (int) $consulta->fetchColumn();

    $consulta = $conexion->prepare(
        "SELECT
            pedidos_nuevos,
            pedidos_cancelados,
            estados_pedido
         FROM preferencia_notificacion
         WHERE id_persona = ?"
    );

    $consulta->execute([$idPersona]);
    $preferencias = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$preferencias) {
        $preferencias = [
            "pedidos_nuevos" => 1,
            "pedidos_cancelados" => 1,
            "estados_pedido" => 1
        ];
    }

    responder(200, [
        "notificaciones" => $notificaciones,
        "sin_leer" => $sinLeer,
        "preferencias" => $preferencias
    ]);
}

/* PUT: marcar notificaciones o actualizar preferencias. */
if ($metodo === "PUT") {

    $datos = leerJson();

    if (!is_array($datos)) {
        responder(400, ["error" => "Datos inválidos"]);
    }

    $accion = $datos["accion"] ?? "";

    if ($accion === "leer") {

        $idNotificacion = (int) ($datos["id_notificacion"] ?? 0);

        if ($idNotificacion <= 0) {
            responder(400, ["error" => "Notificación inválida"]);
        }

        $consulta = $conexion->prepare(
            "UPDATE notificacion
             SET leida = 1
             WHERE id_notificacion = ?
               AND id_persona = ?"
        );

        $consulta->execute([
            $idNotificacion,
            $idPersona
        ]);

        responder(200, [
            "mensaje" => "Notificación marcada como leída"
        ]);
    }

    if ($accion === "leer_todas") {

        $consulta = $conexion->prepare(
            "UPDATE notificacion
             SET leida = 1
             WHERE id_persona = ?
               AND leida = 0"
        );

        $consulta->execute([$idPersona]);

        responder(200, [
            "mensaje" => "Todas las notificaciones fueron marcadas como leídas"
        ]);
    }

    if ($accion === "preferencias") {

        $campos = [
            "pedidos_nuevos",
            "pedidos_cancelados",
            "estados_pedido"
        ];

        $valores = [];

        foreach ($campos as $campo) {
            if (!array_key_exists($campo, $datos)) {
                responder(400, [
                    "error" => "Falta la preferencia: " . $campo
                ]);
            }

            $valor = convertirBooleano($datos[$campo]);

            if ($valor === null) {
                responder(400, [
                    "error" => "Valor inválido para: " . $campo
                ]);
            }

            $valores[] = (int) $valor;
        }

        $consulta = $conexion->prepare(
            "INSERT INTO preferencia_notificacion
             (
                id_persona,
                pedidos_nuevos,
                pedidos_cancelados,
                estados_pedido
             )
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                pedidos_nuevos = VALUES(pedidos_nuevos),
                pedidos_cancelados = VALUES(pedidos_cancelados),
                estados_pedido = VALUES(estados_pedido)"
        );

        $consulta->execute([
            $idPersona,
            $valores[0],
            $valores[1],
            $valores[2]
        ]);

        responder(200, [
            "mensaje" => "Preferencias actualizadas"
        ]);
    }

    responder(400, [
        "error" => "Acción no válida"
    ]);
}

responder(405, [
    "error" => "Método no permitido"
]);