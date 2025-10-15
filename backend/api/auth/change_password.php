<?php
// Endpoint para alteração de password do utilizador autenticado
require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/classes/Auth.php';

header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar se o utilizador está autenticado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not authenticated.']);
    exit;
}

// Receber dados do pedido
$data = json_decode(file_get_contents('php://input'), true);
$currentPassword = $data['currentPassword'] ?? '';
$newPassword = $data['newPassword'] ?? '';

// Validar campos obrigatorios
if (!$currentPassword || !$newPassword) {
    echo json_encode(['success' => false, 'message' => 'Missing fields.']);
    exit;
}

$userId = $_SESSION['user_id'];
$auth = new Auth();

// Verificar se a password atual esta correta
if (!$auth->verifyPassword($userId, $currentPassword)) {
    echo json_encode(['success' => false, 'message' => 'Current password incorrect.']);
    exit;
}

// Validar tamanho da nova password
if (strlen($newPassword) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password too short.']);
    exit;
}

// Atualizar password
if ($auth->updatePassword($userId, $newPassword)) {
    echo json_encode(['success' => true, 'message' => 'Password updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update password.']);
}
