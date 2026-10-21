<?php
$config = require'c:/xampp/privado/config.php';
$conexion = new mysqli(
     $config['host'],
     $config['usuario'],
     $config['clave'],
     $config['base']
);
$conexion->set_charset('utf8mb4');