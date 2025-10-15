<?php
//Endpoint para obter todas as categorias

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/models/Category.php';

header('Content-Type: application/json');

// Validar o método HTTP para garantir apenas GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    // Retornar erro se o método não for GET
    echo json_encode(['success' => false, 'message' => 'Método HTTP não permitido. Apenas GET é suportado.']);
    exit;
}

// Instanciar o modelo Category
$categoriaModelo = new Category();

// obter apenas categorias com pelo menos um evento ativo
$categorias = $categoriaModelo->findWithActiveEvents();

// Retornar categorias sem tokens
if ($categorias) {
    echo json_encode(['success' => true, 'data' => $categorias]);
} else {
    echo json_encode(['success' => false, 'message' => 'Nenhuma categoria encontrada.']);
}
?>
