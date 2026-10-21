<?php
require "conexion.php";

$datos = json_decode(file_get_contents("php://input"), true);
$id = is_array($datos) ? filter_var($datos["id"] ?? null, FILTER_VALIDATE_INT) : false;

if ($id === false || $id < 1) {
    http_response_code(400);
    echo json_encode(["error" => "Indica un ID de producto válido."]);
    exit;
}

$stmt = $conexion->prepare("DELETE FROM productos WHERE id = ?");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo preparar la eliminación del producto."]);
    exit;
}

$stmt->bind_param("i", $id);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo eliminar el producto."]);
    exit;
}

if ($stmt->affected_rows === 0) {
    http_response_code(404);
    echo json_encode(["error" => "No se encontró el producto que intentas eliminar."]);
    exit;
}

echo json_encode(["ok" => true]);
?>
