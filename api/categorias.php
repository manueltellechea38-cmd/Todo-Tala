<?php
require_once __DIR__ . "/comun.php";
require_once __DIR__ . "/conexion.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    responder(405, ["error" => "Metodo no permitido"]);
}

$consulta = $conexion->query(
    "SELECT id_categoria, nombre
     FROM categoria
     ORDER BY nombre"
);

responder(200, $consulta->fetchAll(PDO::FETCH_ASSOC));