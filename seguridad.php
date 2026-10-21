<?php
ini_set('display_errors', '0');
ini_set('log_errors', '1');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start([
        'use_strict_mode' => 1,
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax'
    ]);
}

function json_respuesta(int $estado, array $datos): void {
    http_response_code($estado);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($datos);
    exit;
}

function exigir_login(): void {
    if (!isset($_SESSION['usuario_id'])) {
        json_respuesta(401, ['error' => 'Iniciá sesión']);
    }
}

function exigir_csrf(): void {
    $recibido = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $guardado = $_SESSION['csrf'] ?? '';
    if (!is_string($recibido) || $guardado === '' ||
        !hash_equals($guardado, $recibido)) {
        json_respuesta(403, ['error' => 'Token inválido']);
    }
}

function datos_producto(): array {
    $d = json_decode(file_get_contents('php://input'), true);
    if (!is_array($d)) json_respuesta(400, ['error'=>'JSON inválido']);
    $nombre = trim((string)($d['nombre'] ?? ''));
    $precio = filter_var($d['precio'] ?? null, FILTER_VALIDATE_INT);
    $stock = filter_var($d['stock'] ?? null, FILTER_VALIDATE_INT);
    if ($nombre === '' || mb_strlen($nombre) > 100 ||
        $precio === false || $precio < 0 ||
        $stock === false || $stock < 0) {
        json_respuesta(400, ['error'=>'Datos inválidos']);
    }
    return [$nombre, $precio, $stock];
}