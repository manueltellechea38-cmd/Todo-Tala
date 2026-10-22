<?php

date_default_timezone_set("America/Montevideo");

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

function responder($codigo, $datos) {
    http_response_code($codigo);
    echo json_encode($datos);
    exit;
}

function leerJson() {
    $contenido = file_get_contents("php://input");
    $datos = json_decode($contenido, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        responder(400, ["error" => "JSON inválido"]);
    }

    return $datos;
}