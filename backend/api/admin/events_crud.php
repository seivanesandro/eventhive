<?php
// Endpoint CRUD para gestão de eventos

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../core/models/Event.php';

header('Content-Type: application/json');

// Garantir que só administradores podem aceder
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] != 1) {
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

$eventModel = new Event();

// Verificar se o método é PUT para suportar edição de eventos
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_POST['_method']) && strtoupper($_POST['_method']) === 'PUT') {
    $method = 'PUT';
}
switch ($method) {
    case 'GET':
        // Listar todos os eventos
        $events = $eventModel->findAll();
        echo json_encode(['success' => true, 'events' => $events]);
        break;
    case 'POST':
        // Criar novo evento com suporte a JSON e form-data
        if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
            $data = json_decode(file_get_contents('php://input'), true);
        } else {
            $data = $_POST;
        }

        // Verificar campos obrigatórios
        $requiredFields = ['id_category', 'title', 'description', 'event_date', 'location'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                echo json_encode(['success' => false, 'message' => 'Campo obrigatório em falta: ' . $field]);
                exit;
            }
        }

        // Verificar se é necessário enviar imagem
        $hasFile = isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK;
        $hasUrl = !empty($data['image_url']);
        if (!$hasFile && !$hasUrl) {
            echo json_encode(['success' => false, 'message' => 'É obrigatório enviar uma imagem (ficheiro ou URL).']);
            exit;
        }

        // Processar upload de imagem apenas se for um form-data
        $image_url = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $filename = uniqid('event_', true) . '.' . $ext;
            $dest = $uploadDir . $filename;
            if (move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
                $image_url = '/EventHive/backend/uploads/' . $filename;
            }
        } else if (!empty($data['image_url'])) {
            $image_url = $data['image_url'];
        }
        $data['image_url'] = $image_url;

        // Validar que pelo menos um bilhete é enviado
        $ticketsRaw = '';
        if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false && !empty($data['tickets'])) {
            $ticketsRaw = $data['tickets'];
        } else if (!empty($_POST['tickets'])) {
            $ticketsRaw = $_POST['tickets'];
        }

        // Se bilhetes forem enviados, garantir que é um array válido
        $tickets = is_array($ticketsRaw) ? $ticketsRaw : json_decode($ticketsRaw, true);
        if (empty($tickets) || !is_array($tickets) || count($tickets) === 0) {
            echo json_encode(['success' => false, 'message' => 'É necessário pelo menos um bilhete para o evento.']);
            exit;
        }

        // Criar o evento
        $eventId = $eventModel->create($data);
        $pdo = Database::connect();
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $adminId = $_SESSION['user_id'] ?? null;
        if ($eventId) {
            // Inserir bilhetes
            $stmt = $pdo->prepare("INSERT INTO tickets (id_event, ticket_type, price, quantity_available) VALUES (:id_event, :ticket_type, :price, :quantity_available)");
            foreach ($tickets as $ticket) {
                if (!empty($ticket['ticket_type']) && isset($ticket['price']) && isset($ticket['quantity_available'])) {
                    $stmt->execute([
                        ':id_event' => $eventId,
                        ':ticket_type' => $ticket['ticket_type'],
                        ':price' => $ticket['price'],
                        ':quantity_available' => $ticket['quantity_available'],
                    ]);
                }
            }
            // Registar log de atividade do admin ao criar evento (tabela activity_logs )
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_create_event',
                    ':description' => 'Admin criou o evento ID ' . $eventId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de criação de evento: ' . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Evento criado com sucesso.', 'image_url' => $image_url]);
        } else {
            // Registar tentativa falhada de criação na tabela activity_logs
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_create_event_fail',
                    ':description' => 'Tentativa de criar evento falhou',
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de tentativa falhada de criação de evento: ' . $e->getMessage());
            }
            echo json_encode(['success' => false, 'message' => 'Erro ao criar evento.']);
        }
        break;
    case 'PUT':
        // Atualizar evento
        if (strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
            $data = $_POST;
            $eventId = isset($data['id_event']) ? (int)$data['id_event'] : 0;
            unset($data['id_event']);
            $pdo = Database::connect();
            $ip = $_SERVER['REMOTE_ADDR'] ?? null;
            $adminId = $_SESSION['user_id'] ?? null;
            $eventoAntigo = $eventModel->findById($eventId);
            if (!$eventoAntigo) {
                // Registar tentativa falhada de atualização na tabela activity_logs
                try {
                    $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                    $logStmt->execute([
                        ':id_user' => $adminId,
                        ':action' => 'admin_update_event_fail',
                        ':description' => 'Tentativa de editar evento inexistente ID ' . $eventId,
                        ':ip' => $ip
                    ]);
                } catch (Exception $e) {
                    error_log('Falha ao registar log de tentativa falhada de edição de evento: ' . $e->getMessage());
                }
                echo json_encode(['success' => false, 'message' => 'O evento com esse ID não existe.']);
                exit;
            }

            // Só processar upload de imagem se for enviada
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
                $filename = uniqid('event_', true) . '.' . $ext;
                $dest = $uploadDir . $filename;
                if (move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
                    $data['image_url'] = '/EventHive/backend/uploads/' . $filename;
                }
            } else {
                $data['image_url'] = $eventoAntigo['image_url'] ?? '';
            }
        } else {
            $data = json_decode(file_get_contents('php://input'), true);
            $eventId = $data['id_event'] ?? 0;
            unset($data['id_event']);

            // Se não for enviada nova imagem, manter a imagem antiga
            $eventoAntigo = $eventModel->findById($eventId);
            if ($eventoAntigo && isset($eventoAntigo['image_url'])) {
                $data['image_url'] = $eventoAntigo['image_url'];
            } else {
                $data['image_url'] = '';
            }
        }

        // No update, os campos não são obrigatórios. Preencher campos em falta com valores atuais do evento.
        $oldEvent = $eventModel->findById($eventId);
        if (!$oldEvent) {
            echo json_encode(['success' => false, 'message' => 'Evento com este ID não existe.']);
            exit;
        }

        // Preencher campos em falta com valores atuais do evento
        $fields = ['id_category', 'title', 'description', 'event_date', 'location'];
        foreach ($fields as $field) {
            if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                $data[$field] = $oldEvent[$field];
            }
        }

        // Se não for enviada nova imagem, manter a imagem antiga
        $hasFile = isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK;
        $hasUrl = isset($data['image_url']) && $data['image_url'] !== '';
        if (!$hasFile && !$hasUrl) {
            $data['image_url'] = $oldEvent['image_url'];
        }

        // Se o campo bilhetes for enviado, tem de ser pelo menos um bilhete válido
        $ticketsRaw = '';
        if (isset($data['tickets']) && !empty($data['tickets'])) {
            $ticketsRaw = $data['tickets'];
        } else if (isset($_POST['tickets']) && !empty($_POST['tickets'])) {
            $ticketsRaw = $_POST['tickets'];
        }

        // Se bilhetes forem enviados, garantir que é um array válido
        if ($ticketsRaw !== '') {
            $tickets = is_array($ticketsRaw) ? $ticketsRaw : json_decode($ticketsRaw, true);
            if (empty($tickets) || !is_array($tickets) || count($tickets) === 0) {
                echo json_encode(['success' => false, 'message' => 'É necessário pelo menos um bilhete para o evento se enviar bilhetes.']);
                exit;
            }
        }

        // Verificar se o evento existe antes de atualizar
        $eventoAntigo = $eventModel->findById($eventId);
        $pdo = Database::connect();
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $adminId = $_SESSION['user_id'] ?? null;
        if (!$eventoAntigo) {
            // Registar tentativa falhada de atualização
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_update_event_fail',
                    ':description' => 'Tentativa de editar evento inexistente ID ' . $eventId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de tentativa falhada de edição de evento: ' . $e->getMessage());
            }
            echo json_encode(['success' => false, 'message' => 'O evento com esse ID não existe.']);
            exit;
        }
        $success = $eventModel->update($eventId, $data);

        // Se a atualização for bem sucedida, processar os bilhetes
        if ($success && $eventId) {
            // Processar os bilhetes se enviados (JSON ou form-data)
            $tickets = null;
            if (isset($data['tickets']) && !empty($data['tickets'])) {
                $tickets = is_array($data['tickets']) ? $data['tickets'] : json_decode($data['tickets'], true);
            } else if (isset($_POST['tickets']) && !empty($_POST['tickets'])) {
                $tickets = json_decode($_POST['tickets'], true);
            }
            if (is_array($tickets) && count($tickets) > 0) {
                $pdo->prepare("DELETE FROM tickets WHERE id_event = ?")->execute([$eventId]);
                $stmt = $pdo->prepare("INSERT INTO tickets (id_event, ticket_type, price, quantity_available) VALUES (:id_event, :ticket_type, :price, :quantity_available)");
                foreach ($tickets as $ticket) {
                    if (!empty($ticket['ticket_type']) && isset($ticket['price']) && isset($ticket['quantity_available'])) {
                        $ok = $stmt->execute([
                            ':id_event' => $eventId,
                            ':ticket_type' => $ticket['ticket_type'],
                            ':price' => $ticket['price'],
                            ':quantity_available' => $ticket['quantity_available'],
                        ]);
                        if (!$ok) {
                            echo json_encode(['success' => false, 'message' => 'Erro ao inserir bilhete: ' . json_encode($ticket)]);
                            exit;
                        }
                    }
                }
            }
            // Registar log de atividade do admin ao editar evento (tabela activity_logs)
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_update_event',
                    ':description' => 'Admin editou o evento ID ' . $eventId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de edição de evento: ' . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Evento atualizado com sucesso.', 'image_url' => $data['image_url'] ?? null]);
        } else {
            // Registar tentativa falhada de atualização (tabela activity_logs)
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_update_event_fail',
                    ':description' => 'Tentativa de editar evento falhou ID ' . $eventId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de tentativa falhada de edição de evento: ' . $e->getMessage());
            }

            $debugId = var_export($eventId, true);
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar evento. ID inválido ou update falhou. id_event=' . $debugId]);
        }
        break;
    case 'DELETE':
        // Soft delete marcar evento como terminado 
        $data = json_decode(file_get_contents('php://input'), true);
        $eventId = $data['id_event'] ?? 0;
        $eventoAntigo = $eventModel->findById($eventId);
        $pdo = Database::connect();
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $adminId = $_SESSION['user_id'] ?? null;
        if (!$eventoAntigo) {
            // Registar tentativa falhada de eliminação na tabela activity_logs
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_delete_event_fail',
                    ':description' => 'Tentativa de eliminar evento inexistente ID ' . $eventId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de tentativa falhada de eliminação de evento: ' . $e->getMessage());
            }
            echo json_encode(['success' => false, 'message' => 'O evento com esse ID não existe.']);
            exit;
        }
        $success = $eventModel->delete($eventId);
        if ($success) {
            // Registar log de atividade do admin ao eliminar evento (tabela activity_logs)
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_delete_event',
                    ':description' => 'Admin eliminou o evento ID ' . $eventId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de eliminação de evento: ' . $e->getMessage());
            }
            echo json_encode(['success' => true, 'message' => 'Evento marcado como terminado.']);
        } else {
            // Registar tentativa falhada de eliminação (tabela activity_logs)
            try {
                $logStmt = $pdo->prepare("INSERT INTO activity_logs (id_user, action, description, ip_address, created_at) VALUES (:id_user, :action, :description, :ip, NOW())");
                $logStmt->execute([
                    ':id_user' => $adminId,
                    ':action' => 'admin_delete_event_fail',
                    ':description' => 'Tentativa de eliminar evento falhou ID ' . $eventId,
                    ':ip' => $ip
                ]);
            } catch (Exception $e) {
                error_log('Falha ao registar log de tentativa falhada de eliminação de evento: ' . $e->getMessage());
            }
            echo json_encode(['success' => false, 'message' => 'Erro ao marcar evento como terminado.']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Método não suportado.']);
}
