<?php
// Endpoint para obter detalhes de um evento usando um token

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/models/Event.php';

header('Content-Type: application/json');

// Validar o método HTTP para garantir apenas GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    // Retornar erro se o método não for GET
    echo json_encode(['success' => false, 'message' => 'Método HTTP não permitido. Apenas GET é suportado.']);
    exit;
}

// Obter o token do evento a partir do parâmetro GET
$tokenEvento = isset($_GET['token']) ? $_GET['token'] : '';
if (empty($tokenEvento)) {
    echo json_encode(['success' => false, 'message' => 'Token do evento em falta ou inválido.']);
    exit;
}

// Decodificar o token para obter o ID do evento
$idEvento = null;

// Primeiro tenta decodificar como token simples
$decodificadoSimples = base64_decode($tokenEvento, true);
if ($decodificadoSimples !== false && is_numeric($decodificadoSimples) && intval($decodificadoSimples) > 0) {
    $idEvento = intval($decodificadoSimples);
} else {
    // Se não funcionar, tenta como token
    $eventoModelo = new Event();
    // Procurar evento por token profissional (hash)
    $eventos = $eventoModelo->findAll();
    foreach ($eventos as $evento) {
        $dadosEvento = $evento['id_event'] . '_' . $evento['created_at'] . '_event';
        $tokenProfissional = base64_encode(hash('sha256', $dadosEvento, true));
        if ($tokenProfissional === $tokenEvento) {
            $idEvento = intval($evento['id_event']);
            break;
        }
    }
}

if ($idEvento === null || $idEvento <= 0) {
    echo json_encode(['success' => false, 'message' => 'Token do evento inválido.']);
    exit;
}

// Instanciar o modelo Event
$eventoModelo = new Event();

// Obter detalhes do evento
$evento = $eventoModelo->findById($idEvento);

// Obter bilhetes do evento
$pdo = Database::connect();
$stmtBilhetes = $pdo->prepare("SELECT * FROM tickets WHERE id_event = :idEvento");
$stmtBilhetes->execute([':idEvento' => $idEvento]);
$bilhetes = $stmtBilhetes->fetchAll(PDO::FETCH_ASSOC);

// Devolver resposta em JSON
if ($evento) {
    echo json_encode(['success' => true, 'event' => $evento, 'tickets' => $bilhetes]);
} else {
    echo json_encode(['success' => false, 'message' => 'Evento não encontrado ou token inválido.']);
}
