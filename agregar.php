<?php
require "conexion.php";

$datos = json_decode(file_get_contents("php://input"), true);
$nombre = is_array($datos) ? trim((string) ($datos["nombre"] ?? "")) : "";
$precio = $datos["precio"] ?? null;
$stock = $datos["stock"] ?? null;

if (
    $nombre === "" ||
    strlen($nombre) > 120 ||
    !is_numeric($precio) ||
    !is_finite((float) $precio) ||
    (float) $precio < 0 ||
    (float) $precio > 99999999.99 ||
    filter_var($stock, FILTER_VALIDATE_INT) === false ||
    (int) $stock < 0
) {
    http_response_code(400);
    echo json_encode(["error" => "Ingresa un nombre, un precio válido y una cantidad entera de cero o más."]);
    exit;
}

$precio = (float) $precio;
$stock = (int) $stock;
$stmt = $conexion->prepare("INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo preparar el registro del producto."]);
    exit;
}

$stmt->bind_param("sdi", $nombre, $precio, $stock);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo guardar el producto."]);
    exit;
}

echo json_encode(["ok" => true, "id" => $stmt->insert_id]);
?>
