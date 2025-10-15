<?php
// Endpoint para obter histórico de compras do utilizador autenticado

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/classes/Auth.php';
require_once __DIR__ . '/../../core/models/Order.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $auth = new Auth();
    if (!$auth->isAuthenticated()) {
        echo json_encode(['success' => false, 'message' => 'Utilizador não autenticado.']);
        exit;
    }

    $user = $auth->getUser();
    $userId = $user['id_user'];

    $orderModel = new Order();
    $pdo = $orderModel->getPdo();

    // Query para obter histórico de compras do utilizador com detalhes dos eventos e bilhetes
    $sql = "SELECT o.id_order, o.order_date, o.total_price, o.status,
                   oi.id_order_item, oi.id_ticket, oi.quantity, oi.price_per_ticket,
                   t.ticket_type as ticket_name, t.price as ticket_original_price,
                   e.title as event_name, e.description as event_description, 
                   e.event_date, e.location, e.image_url
            FROM orders o
            INNER JOIN order_items oi ON o.id_order = oi.id_order
            INNER JOIN tickets t ON oi.id_ticket = t.id_ticket
            INNER JOIN events e ON t.id_event = e.id_event
            WHERE o.id_user = :user_id
            ORDER BY o.order_date DESC, o.id_order DESC, oi.id_order_item ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => $userId]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Transformar dados para o formato esperado pelo frontend
    $history = [];
    foreach ($results as $row) {
        $history[] = [
            'id_order' => $row['id_order'],
            'order_date' => $row['order_date'],
            'total_price' => $row['total_price'],
            'status' => $row['status'],
            'event_title' => $row['event_name'],
            'quantity' => $row['quantity'],
            'ticket_type' => $row['ticket_name'],
            'price_per_ticket' => $row['price_per_ticket'],
            'event_date' => $row['event_date'],
            'event_location' => $row['location'],
            'event_image_url' => $row['image_url']
        ];
    }

    echo json_encode([
        'success' => true,
        'history' => $history
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor.',
        'error' => $e->getMessage()
    ]);
}
?>
