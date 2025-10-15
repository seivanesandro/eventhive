<?php
// Endpoint para finalizar a compra (checkout)

require_once __DIR__ . '/../../config/bootstrap.php';

// Incluir modelos
require_once __DIR__ . '/../../core/models/Order.php';


//  Garantir que a sessao esta iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Obter o PDO
$orderModel = new Order();
$pdo = $orderModel->getPdo();

// Verificar se o usuario esta autenticado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
    exit;
}

// Receber os dados do checkout enviados pelo frontend
$data = json_decode(file_get_contents('php://input'), true);

//  Obter o carrinho
$cartItems = [];

// Verificar dados do frontend
if (isset($data['items']) && is_array($data['items']) && !empty($data['items'])) {
    foreach ($data['items'] as $item) {
        if (isset($item['id_ticket']) && isset($item['quantity'])) {
            $cartItems[$item['id_ticket']] = $item['quantity'];
        }
    }
}

// Verificar sessao como fallback
if (empty($cartItems) && isset($_SESSION['cart']) && is_array($_SESSION['cart']) && !empty($_SESSION['cart'])) {
    $cartItems = $_SESSION['cart'];
}

// Verificar se o carrinho esta vazio
if (empty($cartItems)) {
    echo json_encode(['success' => false, 'message' => 'Carrinho vazio.']);
    exit;
}

try {
    // Iniciar transação
    $pdo->beginTransaction();

    // Validar stock e calcular total real
    $totalPrice = 0;
    $ticketData = [];
    foreach ($cartItems as $ticketId => $quantity) {
        // Buscar preço e stock real do bilhete
        $stmt = $pdo->prepare("SELECT price, quantity_available FROM tickets WHERE id_ticket = :id_ticket FOR UPDATE");
        $stmt->execute([':id_ticket' => $ticketId]);
        $ticket = $stmt->fetch();
        if (!$ticket) {
            throw new Exception('Bilhete não encontrado.');
        }
        if ($ticket['quantity_available'] < $quantity) {
            throw new Exception('Stock insuficiente para o bilhete ' . $ticketId);
        }
        $ticketData[$ticketId] = [
            'price' => $ticket['price'],
            'stock' => $ticket['quantity_available'],
            'quantity' => $quantity
        ];
        $totalPrice += $ticket['price'] * $quantity;
    }

    // Criar encomenda
    $stmt = $pdo->prepare("INSERT INTO orders (id_user, total_price, status, order_date) VALUES (:id_user, :total_price, :status, NOW())");
    $orderSuccess = $stmt->execute([
        ':id_user' => $_SESSION['user_id'],
        ':total_price' => $totalPrice,
        ':status' => 'Completed'
    ]);
    if (!$orderSuccess) {
        throw new Exception('Erro ao criar encomenda.');
    }
    $orderId = $pdo->lastInsertId();

    // Inserir cada item do carrinho e atualizar stock
    $itemStmt = $pdo->prepare("INSERT INTO order_items (id_order, id_ticket, quantity, price_per_ticket) VALUES (:id_order, :id_ticket, :quantity, :price_per_ticket)");
    foreach ($ticketData as $ticketId => $data) {
        $itemStmt->execute([
            ':id_order' => $orderId,
            ':id_ticket' => $ticketId,
            ':quantity' => $data['quantity'],
            ':price_per_ticket' => $data['price']
        ]);
    }

    // Registar log de atividade
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $description = 'Checkout realizado com sucesso.';
    $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
    $logStmt->execute([
        ':id_user' => $_SESSION['user_id'],
        ':action' => 'checkout',
        ':description' => $description,
        ':ip' => $ip
    ]);

    // Limpar o carrinho após checkout
    unset($_SESSION['cart']);

    // Log dos dados da compra 
    error_log('Compra finalizada. ID da ordem: ' . $orderId . ', Usuário: ' . $_SESSION['user_id'] . ', Total: ' . $totalPrice);

    // Commit da transação
    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Compra finalizada com sucesso.']);
} catch (Exception $e) {
    // Rollback em caso de erro
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Erro no checkout: ' . $e->getMessage()]);
}
