<?php
// Endpoint CRUD para gestão de categorias

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/Database.php';

header('Content-Type: application/json');

// Garantir que só administradores podem aceder 
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] != 1) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

// Modelo Category PDO
class Category {
    private $pdo;
    public function __construct() {
        $this->pdo = Database::connect();
    }
    public function findAll() {
        $stmt = $this->pdo->query("SELECT * FROM categories");
        return $stmt->fetchAll();
    }
    public function create($data) {
        $sql = "INSERT INTO categories (name) VALUES (:name)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($data);
    }
    public function update($categoryId, $data) {
        $sql = "UPDATE categories SET name = :name WHERE id_category = :id";
        $stmt = $this->pdo->prepare($sql);
        $data[':id'] = $categoryId;
        return $stmt->execute($data);
    }
    public function delete($categoryId) {
        $stmt = $this->pdo->prepare("DELETE FROM categories WHERE id_category = :id");
        return $stmt->execute([':id' => $categoryId]);
    }
}

$categoryModel = new Category();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Listar todas as categorias
        $categories = $categoryModel->findAll();
        echo json_encode(['success' => true, 'categories' => $categories]);
        break;
    case 'POST':
        // Criar nova categoria
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['name']) || trim($data['name']) === '') {
            echo json_encode(['success' => false, 'message' => 'Nome da categoria é obrigatório.']);
            exit;
        }
        $success = $categoryModel->create(['name' => $data['name']]);
        if ($success) {
            // Registar log de atividade do admin ao criar categoria
            try {
                $pdo = Database::connect();
                $ip = $_SERVER['REMOTE_ADDR'] ?? null;
                $adminId = $_SESSION['user_id'] ?? null;
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_create_category',
                    ':description' => 'Admin criou uma nova categoria (' . $data['name'] . ')',
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                // Se falhar o log, registar no error_log mas não bloquear a operação
                error_log('Falha ao registar log de criação de categoria: ' . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Categoria criada com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao criar categoria.']);
        }
        break;
    case 'PUT':
        // Atualizar categoria
        $data = json_decode(file_get_contents('php://input'), true);
        $categoryId = $data['id_category'] ?? 0;
        if (!isset($data['name']) || trim($data['name']) === '') {
            echo json_encode(['success' => false, 'message' => 'Nome da categoria é obrigatório.']);
            exit;
        }
        // Verificar se a categoria existe antes de atualizar
        $pdo = Database::connect();
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $adminId = $_SESSION['user_id'] ?? null;
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE id_category = :id");
        $stmt->execute([':id' => $categoryId]);
        $categoriaExiste = $stmt->fetch();
        if (!$categoriaExiste) {
            // Registar tentativa falhada de atualização na tabela activity_log
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_update_category_fail',
                    ':description' => 'Tentativa de editar categoria inexistente ID ' . $categoryId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de tentativa falhada de edição de categoria: ' . $e->getMessage());
            }
            echo json_encode(['success' => false, 'message' => 'A categoria com esse ID não existe.']);
            exit;
        }
        $success = $categoryModel->update($categoryId, ['name' => $data['name']]);
        if ($success) {
            // Registar na tabela activity_log a atividade do admin ao editar categoria
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_update_category',
                    ':description' => 'Admin editou a categoria ID ' . $categoryId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de edição de categoria: ' . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Categoria atualizada com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar categoria.']);
        }
        break;
    case 'DELETE':
        // Apagar categoria
        $data = json_decode(file_get_contents('php://input'), true);
        $categoryId = $data['id_category'] ?? 0;
        // Verificar se a categoria existe antes de eliminar
        $pdo = Database::connect();
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $adminId = $_SESSION['user_id'] ?? null;
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE id_category = :id");
        $stmt->execute([':id' => $categoryId]);
        $categoriaExiste = $stmt->fetch();
        if (!$categoriaExiste) {
            // Registar tentativa falhada de eliminação na tabela activity_log
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_delete_category_fail',
                    ':description' => 'Tentativa de eliminar categoria inexistente ID ' . $categoryId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de tentativa falhada de eliminação de categoria: ' . $e->getMessage());
            }
            echo json_encode(['success' => false, 'message' => 'A categoria com esse ID não existe.']);
            exit;
        }
        $success = $categoryModel->delete($categoryId);
        if ($success) {
            // Registar na tabela activity_log a atividade do admin ao eliminar categoria
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_delete_category',
                    ':description' => 'Admin apagou a categoria ID ' . $categoryId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de eliminação de categoria: ' . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Categoria apagada com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao apagar categoria.']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Método não suportado.']);
}
