<?php

// Classe Category - representa a tabela de categorias e fornece métodos CRUD

require_once __DIR__ . '/../../config/Database.php';

class Category {
    // Variável para armazenar a ligação PDO à base de dados
    private $pdo;

    // Construtor - inicializa a ligação à base de dados
    public function __construct() {
        $this->pdo = Database::connect();
    }

    // Devolve apenas categorias com pelo menos um evento ativo
 public function findWithActiveEvents() {
        $stmt = $this->pdo->query(
            "SELECT c.* FROM categories c WHERE EXISTS (
                SELECT 1 FROM events e WHERE e.id_category = c.id_category AND e.status = 'ativo'
            ) ORDER BY c.id_category ASC"
        );
        return $stmt->fetchAll();
    }

    // Devolve uma categoria pelo seu ID
    public function findById($categoryId) {
        $stmt = $this->pdo->prepare("SELECT * FROM categories WHERE id_category = :id");
        $stmt->execute([':id' => $categoryId]);
        return $stmt->fetch();
    }

    // Devolve todas as categorias
    public function findAll() {
        $stmt = $this->pdo->query("SELECT * FROM categories ORDER BY id_category ASC");
        return $stmt->fetchAll();
    }

    // Cria uma nova categoria
    public function create($data) {
        $sql = "INSERT INTO categories (name) VALUES (:name)";
        $stmt = $this->pdo->prepare($sql);
        try {
            return $stmt->execute([
                ':name' => $data['name'],
            ]);
        } catch (\PDOException $e) {
            return false;
        }
    }

    // Atualiza os dados de uma categoria
    public function update($categoryId, $data) {
        $sql = "UPDATE categories SET name = :name WHERE id_category = :id";
        $stmt = $this->pdo->prepare($sql);
        try {
            return $stmt->execute([
                ':name' => $data['name'],
                ':id' => $categoryId
            ]);
        } catch (\PDOException $e) {
            return false;
        }
    }

    // Remove uma categoria pelo seu ID
    public function delete($categoryId) {
        $stmt = $this->pdo->prepare("DELETE FROM categories WHERE id_category = :id");
        try {
            return $stmt->execute([':id' => $categoryId]);
        } catch (\PDOException $e) {
            return false;
        }
    }

    // Devolve o objeto PDO para permitir operações diretas na validação de tokens
    public function getPdo() {
        return $this->pdo;
    }
}
