<?php
require __DIR__ . "/seguridad.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: POST");
    json_respuesta(405, ["error" => "Método no permitido"]);
}

$datos = json_decode(file_get_contents("php://input"), true);
$clave = is_array($datos) && is_string($datos["password"] ?? null)
    ? $datos["password"]
    : "";
$hash = '$2y$10$k9lAvbEtZAXpxOQ.9fCcT.ccJ5ufB1jA.cqq1QL/5ftOiU3f42oBW';
if (!password_verify($clave, $hash)) {
    json_respuesta(401, ["error" => "Credenciales incorrectas"]);
}

session_regenerate_id(true);
$_SESSION["admin_autenticado"] = true;
json_respuesta(200, ["ok" => true]);