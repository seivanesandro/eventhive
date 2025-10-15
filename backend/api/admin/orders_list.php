<?php
// Endpoint para listar todas as encomendas e respetivos items
require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/models/Order.php';

header('Content-Type: application/json');

// Garantir que a sessão está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar se o utilizador está autenticado e é admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] != 1) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

try {
    // Ligar à base de dados
    $orderModel = new Order();
    $pdo = $orderModel->getPdo();

    // Query corrigida: join order_items -> tickets -> events
    $sql = "SELECT o.id_order, o.order_date, o.total_price, o.status, o.id_user, u.first_name, u.last_name, u.email,
                   oi.id_order_item, oi.id_ticket, oi.quantity, oi.price_per_ticket,
                   t.id_event, e.title AS event_title
            FROM orders o
            JOIN users u ON o.id_user = u.id_user
            JOIN order_items oi ON o.id_order = oi.id_order
            JOIN tickets t ON oi.id_ticket = t.id_ticket
            JOIN events e ON t.id_event = e.id_event
            ORDER BY o.order_date DESC, o.id_order DESC, oi.id_order_item ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agrupar por encomenda
    $orders = [];
    foreach ($rows as $row) {
        $orderId = $row['id_order'];
        if (!isset($orders[$orderId])) {
            $orders[$orderId] = [
                'id_order' => $orderId,
                'order_date' => $row['order_date'],
                'total_price' => $row['total_price'],
                'status' => $row['status'],
                'user' => [
                    'id_user' => $row['id_user'],
                    'first_name' => $row['first_name'],
                    'last_name' => $row['last_name'],
                    'email' => $row['email'],
                ],
                'items' => [],
            ];
        }
        $orders[$orderId]['items'][] = [
            'id_order_item' => $row['id_order_item'],
            'id_ticket' => $row['id_ticket'],
            'id_event' => $row['id_event'],
            'event_title' => $row['event_title'],
            'quantity' => $row['quantity'],
            'price_per_ticket' => $row['price_per_ticket'],
        ];
    }
    $orders = array_values($orders);
    echo json_encode(['success' => true, 'orders' => $orders]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao obter encomendas.', 'error' => $e->getMessage()]);
}
