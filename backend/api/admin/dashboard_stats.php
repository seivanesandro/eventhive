<?php

// Endpoint para estatísticas do dashboard admin

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/models/Event.php';
require_once __DIR__ . '/../../core/models/User.php';
require_once __DIR__ . '/../../core/models/Order.php';

header('Content-Type: application/json');

// Garantir que só administradores podem aceder
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] != 1) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

try {
    // Total de eventos
    $eventModel = new Event();
    $totalEvents = count($eventModel->findAll());

    // Total de utilizadores
    $userModel = new User();
    $totalUsers = count($userModel->findAll());

    // Total de encomendas
    $orderModel = new Order();
    $orders = $orderModel->findAll();
    $totalSales = count($orders);

    // Receita total e a garantia que o campo correto é usado
    $revenue = 0;
    foreach ($orders as $order) {
        $revenue += isset($order['total_price']) ? floatval($order['total_price']) : 0;
    }

    echo json_encode([
        'success' => true,
        'totalEvents' => $totalEvents,
        'totalUsers' => $totalUsers,
        'totalSales' => $totalSales,
        'revenue' => $revenue
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao obter estatísticas', 'error' => $e->getMessage()]);
}
