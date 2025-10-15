<?php
// Endpoint para listar eventos de uma categoria específica

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/models/Event.php';

header('Content-Type: application/json');

// Validar o método HTTP para garantir apenas GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    // Retornar erro se o método não for GET
    echo json_encode(['success' => false, 'message' => 'Método HTTP não permitido. Apenas GET é suportado.']);
    exit;
}

// Obter o ID da categoria a partir do parâmetro GET
$idCategoria = isset($_GET['category']) ? $_GET['category'] : null;

if (empty($idCategoria)) {
    echo json_encode(['success' => false, 'message' => 'ID da categoria é obrigatório.']);
    exit;
}

// Instanciar o modelo Event
$eventoModelo = new Event();

//  Obter eventos filtrados por categoria diretamente em SQL
$eventosFiltrados = $eventoModelo->findByCategory($idCategoria);

// Gerar tokens para cada evento
if ($eventosFiltrados) {
    foreach ($eventosFiltrados as &$evento) {
        $dadosEvento = $evento['id_event'] . '_' . $evento['created_at'] . '_event';
        $evento['token'] = base64_encode(hash('sha256', $dadosEvento, true));
        $evento['simple_token'] = base64_encode($evento['id_event']);
    }
    echo json_encode(['success' => true, 'events' => $eventosFiltrados, 'categoryId' => $idCategoria]);
} else {
    echo json_encode(['success' => false, 'message' => 'Nenhum evento encontrado para esta categoria.', 'categoryId' => $idCategoria]);
}
?>
