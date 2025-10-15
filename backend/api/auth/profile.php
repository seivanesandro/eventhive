<?php

// Endpoint para obter perfil do utilizador autenticado
require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/classes/Auth.php';

header('Content-Type: application/json');

$auth = new Auth();
if ($auth->isAuthenticated()) {
    $user = $auth->getUser();
    echo json_encode(['success' => true, 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
}
