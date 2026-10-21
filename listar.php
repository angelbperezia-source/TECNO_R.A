<?php
require "conexion.php";

$result = $conexion->query("SELECT id, nombre, precio, stock FROM productos ORDER BY nombre ASC, id ASC");

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo cargar el inventario."]);
    exit;
}

$productos = [];
while ($producto = $result->fetch_assoc()) {
    $producto["id"] = (int) $producto["id"];
    $producto["precio"] = (float) $producto["precio"];
    $producto["stock"] = (int) $producto["stock"];
    $productos[] = $producto;
}

echo json_encode($productos);
?>
