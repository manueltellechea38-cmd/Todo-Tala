<?php

function preferenciaNotificacionHabilitada($conexion, $idPersona, $tipo) {
    $preferencias = [
        "pedido_nuevo" => "pedidos_nuevos",
        "pedido_cancelado" => "pedidos_cancelados",
        "estado_pedido" => "estados_pedido"
    ];

    if (!isset($preferencias[$tipo])) {
        return true;
    }

    $columna = $preferencias[$tipo];

    $consulta = $conexion->prepare(
        "SELECT $columna
         FROM preferencia_notificacion
         WHERE id_persona = ?"
    );

    $consulta->execute([$idPersona]);
    $resultado = $consulta->fetchColumn();

    return $resultado === false || (bool) $resultado;
}

/* Inserta una notificación respetando las preferencias del usuario. */
function crearNotificacion($conexion, $idPersona, $mensaje, $tipo = "general") {
    if (!preferenciaNotificacionHabilitada(
        $conexion,
        $idPersona,
        $tipo
    )) {
        return false;
    }

    $consulta = $conexion->prepare(
        "INSERT INTO notificacion
         (id_persona, mensaje, tipo)
         VALUES (?, ?, ?)"
    );

    $consulta->execute([
        $idPersona,
        mb_substr($mensaje, 0, 255),
        $tipo
    ]);

    return true;
}

/* Obtiene al jefe y a los empleados de un comercio. */
function obtenerDestinatariosComercio($conexion, $idComercio) {
    $consulta = $conexion->prepare(
        "SELECT id_jefe AS id_persona
         FROM comercio
         WHERE id_comercio = ?

         UNION

         SELECT id_persona
         FROM empleado
         WHERE id_comercio = ?"
    );

    $consulta->execute([
        $idComercio,
        $idComercio
    ]);

    return array_map(
        "intval",
        $consulta->fetchAll(PDO::FETCH_COLUMN)
    );
}

/* Envía una notificación a todos los integrantes del comercio. */
function notificarComercio(
    $conexion,
    $idComercio,
    $mensaje,
    $tipo
) {
    $destinatarios = obtenerDestinatariosComercio(
        $conexion,
        $idComercio
    );

    foreach ($destinatarios as $idPersona) {
        crearNotificacion(
            $conexion,
            $idPersona,
            $mensaje,
            $tipo
        );
    }
}