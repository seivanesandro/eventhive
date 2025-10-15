<?php
// Classe User - representa a tabela de utilizadores com os métodos CRUD

require_once __DIR__ . '/../../config/Database.php';

class User {
    // Variável para armazenar a ligação PDO à base de dados
    private $pdo;

    // Construtor - inicializa a ligação à base de dados
    public function __construct() {
        $this->pdo = Database::connect();
    }

    // Devolve um utilizador pelo seu ID
    public function findById($userId) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id_user = :id AND active = 1");
        $stmt->execute([':id' => $userId]);
        return $stmt->fetch();
    }

    // Devolve todos os utilizadores
    public function findAll() {
        $stmt = $this->pdo->query("SELECT * FROM users"); // Admin pode ver todos, inclusive inativos
        return $stmt->fetchAll();
    }

    // Cria um novo utilizador
    public function create($data) {
        if (!isset($data['active'])) {
            $data['active'] = 1;
        }
        $sql = "INSERT INTO users (id_role, first_name, last_name, email, password_hash, active) VALUES (:id_role, :first_name, :last_name, :email, :password_hash, :active)";
        $stmt = $this->pdo->prepare($sql);
        try {
            return $stmt->execute([
                ':id_role' => $data['id_role'],
                ':first_name' => $data['first_name'],
                ':last_name' => $data['last_name'],
                ':email' => $data['email'],
                ':password_hash' => $data['password_hash'],
                ':active' => $data['active'],
            ]);
        } catch (\PDOException $e) {
            return false;
        }
    }

    // Atualiza os dados de um utilizador
    public function update($userId, $data) {
        $fields = [];
        $params = [':id' => $userId];
        foreach (["first_name", "last_name", "email", "id_role", "active", "password_hash"] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        if (empty($fields)) return false;
        $sql = "UPDATE users SET ".implode(", ", $fields)." WHERE id_user = :id";
        $stmt = $this->pdo->prepare($sql);
        try {
            return $stmt->execute($params);
        } catch (\PDOException $e) {
            return false;
        }
    }

    // Remove um utilizador pelo seu ID utiliza o Soft delete e desativa o utilizador o campo active da tabela users passa a 0
    public function delete($userId) {
        $stmt = $this->pdo->prepare("UPDATE users SET active = 0 WHERE id_user = :id");
        try {
            return $stmt->execute([':id' => $userId]);
        } catch (\PDOException $e) {
            return false;
        }
    }
}
