<?php

// Endpoint para registo de utilizador
require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/classes/Auth.php';

header('Content-Type: application/json');

// Receber dados do pedido
$data = json_decode(file_get_contents('php://input'), true);
$firstName = $data['first_name'] ?? '';
$lastName = $data['last_name'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Validar dados mínimos
if (!$firstName || !$lastName || !$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

// Chamar metodo de registo
$auth = new Auth();
$success = $auth->register($firstName, $lastName, $email, $password);

if ($success) {
    // Registar actividade no activity_logs
    $pdo = (new Auth())->getPdo();
    $stmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address) VALUES (NULL, 'register_success', 'User registered successfully.', :ip)");
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $stmt->execute([':ip' => $ip]);
    echo json_encode(['success' => true, 'message' => 'User registered successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to register user.']);
}
