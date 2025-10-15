<?php
// Endpoint para adicionar um item ao carrinho

require_once __DIR__ . '/../../config/bootstrap.php';

header('Content-Type: application/json');

// Iniciar sessao para aceder ao carrinho
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Receber dados do pedido
$data = json_decode(file_get_contents('php://input'), true);
$ticketId = $data['ticket_id'] ?? 0;
$quantity = $data['quantity'] ?? 1;

if ($ticketId <= 0 || $quantity <= 0) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
    exit;
}

// Adicionar item ao carrinho na sessão
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}
if (isset($_SESSION['cart'][$ticketId])) {
    $_SESSION['cart'][$ticketId] += $quantity;
} else {
    $_SESSION['cart'][$ticketId] = $quantity;
}

echo json_encode(['success' => true, 'message' => 'Item adicionado ao carrinho.']);
