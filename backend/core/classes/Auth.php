<?php
// Classe de autenticação de utilizadores

require_once __DIR__ . '/../../config/Database.php'; 
require_once __DIR__ . '/SessionManager.php'; 

class Auth {
    private $pdo;

    // Construtor - Inicializa a ligação à base de dados e inicia a sessão de forma segura
    public function __construct() {
        $this->pdo = Database::connect();
        SessionManager::start();
    }

    // Devolve o objeto PDO para operações avançadas (ex: logs de atividade)
    public function getPdo() {
        return $this->pdo;
    }


    // Regista um novo utilizador na base de dados com password encriptada
    public function register($firstName, $lastName, $email, $password) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (id_role, first_name, last_name, email, password_hash, active) VALUES (2, :first_name, :last_name, :email, :password_hash, 1)";
        $stmt = $this->pdo->prepare($sql);
        try {
            $stmt->execute([
                ':first_name' => $firstName,
                ':last_name' => $lastName,
                ':email' => $email,
                ':password_hash' => $hash
            ]);
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }


    // Autentica o utilizador, verifica a password e inicia sessão
    public function login($email, $password) {
        $sql = "SELECT * FROM users WHERE email = :email AND active = 1 LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();
            if ($user && password_verify($password, $user['password_hash'])) {
                $_SESSION['user_id'] = $user['id_user'];
                $_SESSION['user_role'] = $user['id_role']; // Padronizar para 'user_role'
            SessionManager::regenerate();
            return true;
        }
        return false;
    }


    // Termina a sessão do utilizador de forma segura
    public function logout() {
        SessionManager::destroy();
    }



    // Verifica se o utilizador está autenticado, sessão iniciada
    public function isAuthenticated() {
        return isset($_SESSION['user_id']) && isset($_SESSION['user_role']);
    }

    // Verifica se a password atual está correta para o utilizador
    public function verifyPassword($userId, $currentPassword) {
        $sql = "SELECT password_hash FROM users WHERE id_user = :id AND active = 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        if ($user && password_verify($currentPassword, $user['password_hash'])) {
            return true;
        }
        return false;
    }

    // Atualiza a password do utilizador na base de dados
    public function updatePassword($userId, $newPassword) {
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql = "UPDATE users SET password_hash = :password_hash WHERE id_user = :id AND active = 1";
        $stmt = $this->pdo->prepare($sql);
        try {
            $stmt->execute([':password_hash' => $hash, ':id' => $userId]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            return false;
        }
    }


    // Devolve os dados do utilizador autenticado ou null se não estiver autenticado
    public function getUser() {
        if ($this->isAuthenticated()) {
            $sql = "SELECT id_user, id_role, first_name, last_name, email FROM users WHERE id_user = :id AND active = 1";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':id' => $_SESSION['user_id']]);
            return $stmt->fetch();
        }
        return null;
    }

    // Verifica se o utilizador autenticado tem permissões de administrador
    public function isAdmin() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] == 1;
    }
}
