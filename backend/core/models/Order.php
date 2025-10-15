<?php
// Classe Order - representa a tabela de encomendas e fornece métodos CRUD

require_once __DIR__ . '/../../config/Database.php';

class Order {
    //  Variável para armazenar a ligação PDO à base de dados
    private $pdo;

    // Construtor - inicializa a ligação à base de dados
    public function __construct() {
        $this->pdo = Database::connect();
    }

    // Devolve uma encomenda pelo seu ID
    public function findById($orderId) {
        $stmt = $this->pdo->prepare("SELECT * FROM orders WHERE id_order = :id");
        $stmt->execute([':id' => $orderId]);
        return $stmt->fetch();
    }

    // Devolve todas as encomendas
    public function findAll() {
        $stmt = $this->pdo->query("SELECT * FROM orders");
        return $stmt->fetchAll();
    }

    // Cria uma nova encomenda
    public function create($data) {
        $sql = "INSERT INTO orders (id_user, total_price, status, order_date) VALUES (:id_user, :total_price, :status, NOW())";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($data);
    }

    // Atualiza os dados de uma encomenda
    public function update($orderId, $data) {
        $sql = "UPDATE orders SET id_user = :id_user, total_price = :total_price, status = :status WHERE id_order = :id";
        $stmt = $this->pdo->prepare($sql);
        $data[':id'] = $orderId;
        return $stmt->execute($data);
    }

    // Remove uma encomenda pelo seu ID
    public function delete($orderId) {
        $stmt = $this->pdo->prepare("DELETE FROM orders WHERE id_order = :id");
        return $stmt->execute([':id' => $orderId]);
    }

    // Devolve o objeto PDO para permitir operações diretas
    public function getPdo() {
        return $this->pdo;
    }
}
