<?php
// Classe responsável por criar e devolver a ligação PDO à base de dados

class Database {
    // Método estático para criar a ligação PDO
    public static function connect() {
        // Definir as variáveis de ligação a partir das variáveis de ambiente
        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $db   = $_ENV['DB_NAME'] ?? 'eventhive_db';
        $user = $_ENV['DB_USER'] ?? 'root';
        $pass = $_ENV['DB_PASS'] ?? '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            // Criar e devolver o objeto PDO
            return new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            // Em caso de erro, mostrar mensagem clara
            die('Erro na ligação à base de dados: ' . $e->getMessage());
        }
    }
}

// Teste rápido à ligação 
if (php_sapi_name() === 'cli-server' || (isset($_GET['testdb']) && $_GET['testdb'] === '1')) {
    require_once __DIR__ . '/bootstrap.php';
    $ligacao = Database::connect();
    if ($ligacao) {
        echo 'Ligação à base de dados bem sucedida!';
    }
}
