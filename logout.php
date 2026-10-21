<?php
require __DIR__ . "/seguridad.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: POST");
    json_respuesta(405, ["error" => "Método no permitido"]);
}

unset($_SESSION["admin_autenticado"]);
session_regenerate_id(true);
json_respuesta(200, ["ok" => true]);