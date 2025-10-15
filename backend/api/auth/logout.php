<?php
// Endpoint para logout de utilizador

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/classes/Auth.php';

header('Content-Type: application/json');

// Terminar sessão
$auth = new Auth();
$auth->logout();
echo json_encode(['success' => true, 'message' => 'Logout successful.']);
