<?php
require "conexion.php";

$datos = json_decode(file_get_contents("php://input"), true);
$id = is_array($datos) ? filter_var($datos["id"] ?? null, FILTER_VALIDATE_INT) : false;
$nombre = is_array($datos) ? trim((string) ($datos["nombre"] ?? "")) : "";
$precio = $datos["precio"] ?? null;
$stock = $datos["stock"] ?? null;

if (
    $id === false ||
    $id < 1 ||
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
    echo json_encode(["error" => "Los datos del producto no son válidos."]);
    exit;
}

$precio = (float) $precio;
$stock = (int) $stock;
$stmt = $conexion->prepare("UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo preparar la actualización del producto."]);
    exit;
}

$stmt->bind_param("sdii", $nombre, $precio, $stock, $id);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo actualizar el producto."]);
    exit;
}

if ($stmt->affected_rows === 0) {
    $stmt->close();
    $check = $conexion->prepare("SELECT id FROM productos WHERE id = ?");
    $check->bind_param("i", $id);
    $check->execute();
    $existe = $check->get_result()->num_rows > 0;
    $check->close();

    if (!$existe) {
        http_response_code(404);
        echo json_encode(["error" => "No se encontró el producto que intentas editar."]);
        exit;
    }
} else {
    $stmt->close();
}

echo json_encode(["ok" => true]);
?>
