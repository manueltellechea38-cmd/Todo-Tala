<?php
require_once __DIR__ . "/comun.php";
require_once __DIR__ . "/conexion.php";
require_once __DIR__ . "/seguridad.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(405, ["error" => "Metodo no permitido"]);
}

$usuario = requerirRol($conexion, ["jefe", "empleado"]);

$id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);

if (!$id || $id < 1) {
    responder(400, ["error" => "ID de producto invalido"]);
}

/* Comprueba que el producto pertenezca al comercio del usuario. */
if ($usuario["rol"] === "jefe") {
    $sql = "SELECT p.id_producto
            FROM producto p
            INNER JOIN comercio c ON c.id_comercio = p.id_comercio
            WHERE p.id_producto = ? AND c.id_jefe = ?";
} else {
    $sql = "SELECT p.id_producto
            FROM producto p
            INNER JOIN empleado e ON e.id_comercio = p.id_comercio
            WHERE p.id_producto = ? AND e.id_persona = ?";
}

$consulta = $conexion->prepare($sql);
$consulta->execute([$id, $usuario["id_persona"]]);

if (!$consulta->fetch(PDO::FETCH_ASSOC)) {
    responder(404, ["error" => "Producto no encontrado en tu comercio"]);
}

if (!isset($_FILES["imagen"])) {
    responder(400, [
        "error" => "No se recibio la imagen. Revisa tambien los limites de PHP"
    ]);
}

$archivo = $_FILES["imagen"];

if (is_array($archivo["error"])) {
    responder(400, ["error" => "Envia una sola imagen"]);
}

if (in_array($archivo["error"], [
    UPLOAD_ERR_INI_SIZE,
    UPLOAD_ERR_FORM_SIZE
], true)) {
    responder(413, ["error" => "La imagen supera el limite de PHP"]);
}

if ($archivo["error"] !== UPLOAD_ERR_OK) {
    responder(400, ["error" => "No se pudo recibir la imagen"]);
}

if ($archivo["size"] > 2 * 1024 * 1024) {
    responder(413, ["error" => "La imagen debe pesar como maximo 2 MB"]);
}

if (!is_uploaded_file($archivo["tmp_name"])) {
    responder(400, ["error" => "Archivo no valido"]);
}

if (!class_exists("finfo")) {
    responder(500, ["error" => "Falta activar la extension fileinfo en PHP"]);
}

$tipos = [
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "image/webp" => "webp"
];

$finfo = new finfo(FILEINFO_MIME_TYPE);
$tipo = $finfo->file($archivo["tmp_name"]);

if (!isset($tipos[$tipo])) {
    responder(415, ["error" => "Usa una imagen JPG, PNG o WEBP"]);
}

$medidas = @getimagesize($archivo["tmp_name"]);

if (!$medidas || $medidas[0] > 6000 || $medidas[1] > 6000) {
    responder(400, [
        "error" => "Imagen invalida o mayor de 6000 por 6000 pixeles"
    ]);
}

$carpeta = __DIR__ . "/uploads";

if (!is_dir($carpeta) && !mkdir($carpeta, 0755, true)) {
    responder(500, ["error" => "No se pudo crear la carpeta de imagenes"]);
}

$nombre = bin2hex(random_bytes(16)) . "." . $tipos[$tipo];
$destino = $carpeta . "/" . $nombre;

if (!move_uploaded_file($archivo["tmp_name"], $destino)) {
    responder(500, ["error" => "No se pudo guardar el archivo"]);
}

try {
    $consulta = $conexion->prepare(
        "UPDATE producto SET imagen = ? WHERE id_producto = ?"
    );
    $consulta->execute([$nombre, $id]);
} catch (Throwable $error) {
    @unlink($destino);
    responder(500, ["error" => "No se pudo registrar la imagen en MySQL"]);
}

responder(200, [
    "mensaje" => "Imagen guardada correctamente",
    "imagen" => $nombre
]);