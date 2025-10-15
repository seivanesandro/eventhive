<?php
// Endpoint para login de utilizador

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/classes/Auth.php';

header('Content-Type: application/json');

// obter os dados do pedido
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Validar se os campos obrigatórios foram preenchidos
if (!$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

// Validar formato do email e tamanho mínimo da password
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    // Validar Email inválido
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}
if (strlen($password) < 6) {
    // Validar password muito curta
    echo json_encode(['success' => false, 'message' => 'Password too short (minimum 6 characters).']);
    exit;
}

// Limite de tentativas de login e bloqueio temporário
$authTmp = new Auth();
$pdo = $authTmp->getPdo();
$maxAttempts = 5;
$blockMinutes = 10;
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$now = date('Y-m-d H:i:s');

// Verificar tentativas recentes
$stmt = $pdo->prepare("SELECT COUNT(*) as fail_count, MAX(created_at) as last_fail FROM activity_logs WHERE action = 'login_fail' AND ip_address = :ip AND created_at > (NOW() - INTERVAL :blockMinutes MINUTE)");
$stmt->execute([':ip' => $ip, ':blockMinutes' => $blockMinutes]);
$fail = $stmt->fetch();
if ($fail && $fail['fail_count'] >= $maxAttempts) {
    echo json_encode(['success' => false, 'message' => 'Too many failed attempts. Please try again in ' . $blockMinutes . ' minutes.']);
    exit;
}

// Instanciar a classe Auth
$auth = new Auth();

// Chamar o metodo de login e devolver sucesso apenas se as credenciais estiverem corretas
$success = $auth->login($email, $password);

// Registar na tabela activity_logs
if ($success) {
    // Obter dados do usuário para retornar na resposta
    $user = $auth->getUser();
    // Garantir que a role do utilizador está na sessão para endpoints de admin
    $_SESSION['user_role'] = $user['id_role'];
    $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, created_at, ip_address) VALUES (:id_user, :action, :description, NOW(), :ip)");
    $logStmt->execute([
        ':id_user' => $_SESSION['user_id'],
        ':action' => 'login_success',
        ':description' => 'User successfully authenticated.',
        ':ip' => $ip
    ]);
    // Retornar sucesso com dados do usuario
    echo json_encode([
        'success' => true, 
        'message' => 'Login successful.',
        'user' => [
            'id' => $user['id_user'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'email' => $user['email'],
            'id_role' => $user['id_role']
        ]
    ]);
} else {
    $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, created_at, ip_address) VALUES (NULL, :action, :description, NOW(), :ip)");
    $logStmt->execute([
        ':action' => 'login_fail',
        ':description' => 'Failed login attempt.',
        ':ip' => $ip
    ]);
    echo json_encode(['success' => false, 'message' => 'Invalid credentials.']);
}
