<?php
// Endpoint para obter detalhes de um evento específico

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/models/Event.php';

header('Content-Type: application/json');

// Obter o ID do evento a partir do parâmetro GET
$eventId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($eventId <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID do evento inválido.']);
    exit;
}

// Instanciar o modelo Event
$eventModel = new Event();

// Obter detalhes do evento
$event = $eventModel->findById($eventId);

// Obter bilhetes do evento
$pdo = Database::connect();
$ticketsStmt = $pdo->prepare("SELECT * FROM tickets WHERE id_event = :eventId");
$ticketsStmt->execute([':eventId' => $eventId]);
$tickets = $ticketsStmt->fetchAll(PDO::FETCH_ASSOC);

// Devolver resposta em JSON
if ($event) {
    echo json_encode(['success' => true, 'event' => $event, 'tickets' => $tickets]);
} else {
    echo json_encode(['success' => false, 'message' => 'Evento não encontrado.']);
}
