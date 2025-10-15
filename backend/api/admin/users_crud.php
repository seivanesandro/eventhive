<?php
// Endpoint CRUD para gestão de utilizadores

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/models/User.php';

header('Content-Type: application/json');

//  Garantir que só administradores podem aceder
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] != 1) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

$userModel = new User();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Listar todos os utilizadores
        $users = $userModel->findAll();
        echo json_encode(['success' => true, 'users' => $users]);
        break;
    case 'POST':
        // Criar novo utilizador
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id_role'], $data['first_name'], $data['last_name'], $data['email'], $data['password'])) {
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios em falta.']);
            exit;
        }

        // Hash da password
        $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        unset($data['password']);
        $success = $userModel->create($data);
        if ($success) {
            // Registar log de atividade do admin ao criar utilizador na tabela activity_logs
            try {
                require_once __DIR__ . '/../../config/Database.php';
                $pdo = Database::connect();
                $ip = $_SERVER['REMOTE_ADDR'] ?? null;
                $adminId = $_SESSION['user_id'] ?? null;
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_create_user',
                    ':description' => 'Admin criou um novo utilizador (' . $data['email'] . ')',
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                // Se falhar o log, registar no activity_log mas não bloquear a operação
                error_log('Falha ao registar log de criação de utilizador: ' . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Utilizador criado com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao criar utilizador.']);
        }
        break;
    case 'PUT':

        // Atualizar utilizador
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = isset($data['id_user']) ? (int)$data['id_user'] : 0;
        if ($userId <= 0) {
            echo json_encode(['success' => false, 'message' => 'ID de utilizador inválido.']);
            exit;
        }
        unset($data['id_user']);
        if (isset($data['password']) && $data['password']) {
            $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
            unset($data['password']);
        }

        // Verificar se o utilizador existe antes de atualizar
        $userExists = $userModel->findById($userId);
        require_once __DIR__ . '/../../config/Database.php';
        $pdo = Database::connect();
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $adminId = $_SESSION['user_id'] ?? null;
        if (!$userExists) {
            // Registar tentativa falhada de atualização na tabela activity_log
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_update_user_fail',
                    ':description' => 'Tentativa de editar utilizador inexistente ID ' . $userId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de tentativa falhada de edição: ' . $e->getMessage());
            }
            echo json_encode(['success' => false, 'message' => 'O utilizador com esse ID não existe.']);
            exit;
        }
        $success = $userModel->update($userId, $data);
        if ($success) {
            // Registar log de atividade do admin ao editar utilizador (tabela events activity_logs)
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_update_user',
                    ':description' => 'Admin editou o utilizador ID ' . $userId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de edição de utilizador: ' . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Utilizador atualizado com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar utilizador.']);
        }
        break;
    case 'DELETE':

        // Soft delete
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = $data['id_user'] ?? 0;

        // Verificar se o utilizador existe antes de eliminar
        $userExists = $userModel->findById($userId);
        require_once __DIR__ . '/../../config/Database.php';
        $pdo = Database::connect();
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $adminId = $_SESSION['user_id'] ?? null;
        if (!$userExists) {
            // Registar tentativa falhada de eliminação na tabela activity_log
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_delete_user_fail',
                    ':description' => 'Tentativa de eliminar utilizador inexistente ID ' . $userId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de tentativa falhada de eliminação: ' . $e->getMessage());
            }
            echo json_encode(['success' => false, 'message' => 'O utilizador com esse ID não existe.']);
            exit;
        }
        $success = $userModel->delete($userId);
        if ($success) {
            // Registar log de atividade do admin ao eliminar/desativar utilizador (activity_logs)
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_delete_user',
                    ':description' => 'Admin desativou o utilizador ID ' . $userId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de eliminação de utilizador: ' . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Utilizador desativado com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao desativar utilizador.']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Method not supported.']);
}
