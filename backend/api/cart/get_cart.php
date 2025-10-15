<?php
// Endpoint para obter o conteúdo do carrinho

require_once __DIR__ . '/../../config/bootstrap.php';

header('Content-Type: application/json');

// Iniciar sessão para aceder ao carrinho
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Devolver o carrinho atual
$cart = $_SESSION['cart'] ?? [];
echo json_encode(['success' => true, 'cart' => $cart]);
