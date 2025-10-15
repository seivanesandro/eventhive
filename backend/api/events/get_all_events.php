<?php
// Endpoint para listar todos os eventos com tokens seguros

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/models/Event.php';

header('Content-Type: application/json');

// Instanciar o modelo Event
$eventModel = new Event();

// Obter todos os eventos
$events = $eventModel->findAll();

// Adicionar token sha256 a cada evento para proteger IDs na URL
if ($events) {
    foreach ($events as &$event) {
        $eventData = $event['id_event'] . '_' . $event['created_at'] . '_event';
        $event['token'] = base64_encode(hash('sha256', $eventData, true));
        $event['simple_token'] = base64_encode($event['id_event']);
    }
    echo json_encode(['success' => true, 'events' => $events]);
} else {
    echo json_encode(['success' => false, 'message' => 'Nenhum evento encontrado.']);
}
