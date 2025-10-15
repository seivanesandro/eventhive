<?php
// Endpoint para remover um item do carrinho

require_once __DIR__ . '/../../config/bootstrap.php';

header('Content-Type: application/json');

// Iniciar sessão para aceder ao carrinho
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Receber dados do pedido
$data = json_decode(file_get_contents('php://input'), true);
$ticketId = $data['ticket_id'] ?? 0;

if ($ticketId <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID do bilhete inválido.']);
    exit;
}

// Remover item do carrinho
if (isset($_SESSION['cart'][$ticketId])) {
    unset($_SESSION['cart'][$ticketId]);
    echo json_encode(['success' => true, 'message' => 'Item removido do carrinho.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Item não encontrado no carrinho.']);
}
