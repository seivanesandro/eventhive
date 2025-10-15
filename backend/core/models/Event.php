<?php
// Classe Event - representa a tabela de eventos e fornece métodos CRUD

require_once __DIR__ . '/../../config/Database.php';

class Event {
    // Variável para armazenar a ligação PDO à base de dados
    private $pdo;

    // Construtor - inicializa a ligação à base de dados
    public function __construct() {
        $this->pdo = Database::connect();
    }

    // Devolve um evento pelo seu ID
    public function findById($eventId) {
        $stmt = $this->pdo->prepare("SELECT events.*, categories.name AS category_name FROM events JOIN categories ON events.id_category = categories.id_category WHERE events.id_event = :id");
        $stmt->execute([':id' => $eventId]);
        return $stmt->fetch();
    }

    // Devolve todos os eventos e atualiza status automaticamente( 3 minutos após o término data hora )
    private function updateTerminatedEvents() {
        // Selecionar eventos cuja data/hora já passou há pelo menos 3 minutos e status ainda não é 'terminado'
        $sql = "SELECT id_event FROM events WHERE event_date < (NOW() - INTERVAL 3 MINUTE) AND status != 'terminado'";
        $ids = $this->pdo->query($sql)->fetchAll(PDO::FETCH_COLUMN);
        if (!empty($ids)) {
            foreach ($ids as $eventId) {
                // Atualizar status para terminado
                $this->pdo->prepare("UPDATE events SET status = 'terminado' WHERE id_event = ?")->execute([$eventId]);
            }
        }
    }

    // Devolve todos os eventos e atualiza status automaticamente
    public function findAll() {
        $this->updateTerminatedEvents(); // Atualiza status antes de buscar
        $stmt = $this->pdo->query("SELECT events.*, categories.name AS category_name FROM events JOIN categories ON events.id_category = categories.id_category");
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($events as &$event) {
            // Adicionar detalhes dos bilhetes associados a cada evento
            $event['tickets'] = $this->getTicketsByEvent($event['id_event']);

            // Verificar se existem bilhetes comprados para este evento
            $event['has_tickets_sold'] = $this->hasTicketsSold($event['id_event']);

            // Calcular o numero total de bilhetes vendidos para este evento
            $event['tickets_sold'] = $this->getTicketsSoldCount($event['id_event']);
        }
        return $events;
    }

    // Devolve o número total de bilhetes vendidos para um evento
    public function getTicketsSoldCount($eventId) {
        $sql = "SELECT SUM(oi.quantity) FROM order_items oi INNER JOIN tickets t ON oi.id_ticket = t.id_ticket WHERE t.id_event = :id_event";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_event' => $eventId]);
        $count = $stmt->fetchColumn();
        return $count ? (int)$count : 0;
    }

        // Devolve eventos filtrados por categoria e apenas ativos
        public function findByCategory($idCategoria) {
            $this->updateTerminatedEvents(); // Atualiza status antes de buscar
            $sql = "SELECT events.*, categories.name AS category_name FROM events JOIN categories ON events.id_category = categories.id_category WHERE events.id_category = :idCategoria AND events.status = 'ativo'";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':idCategoria' => $idCategoria]);
            $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($eventos as &$evento) {
                $evento['tickets'] = $this->getTicketsByEvent($evento['id_event']);
                $evento['has_tickets_sold'] = $this->hasTicketsSold($evento['id_event']);
                $evento['tickets_sold'] = $this->getTicketsSoldCount($evento['id_event']);
            }
            return $eventos;
        }

    // Verifica se existem bilhetes comprados para um evento (order_items)
    public function hasTicketsSold($eventId) {
        $sql = "SELECT COUNT(*) FROM order_items oi INNER JOIN tickets t ON oi.id_ticket = t.id_ticket WHERE t.id_event = :id_event";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_event' => $eventId]);
        $count = $stmt->fetchColumn();
        return $count > 0;
    }

    public function getTicketsByEvent($eventId) {
        $stmt = $this->pdo->prepare("SELECT * FROM tickets WHERE id_event = :id_event");
        $stmt->execute([':id_event' => $eventId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Cria um novo evento
    public function create($data) {
        $sql = "INSERT INTO events (id_category, title, description, event_date, location, image_url) VALUES (:id_category, :title, :description, :event_date, :location, :image_url)";
        $stmt = $this->pdo->prepare($sql);
        try {
            $result = $stmt->execute([
                ':id_category' => $data['id_category'],
                ':title' => $data['title'],
                ':description' => $data['description'],
                ':event_date' => $data['event_date'],
                ':location' => $data['location'],
                ':image_url' => $data['image_url'],
            ]);
            if ($result) {
                return $this->pdo->lastInsertId();
            } else {
                return false;
            }
        } catch (\PDOException $e) {
            return false;
        }
    }

    // Atualiza os dados de um evento
    public function update($eventId, $data) {
        $sql = "UPDATE events SET id_category = :id_category, title = :title, description = :description, event_date = :event_date, location = :location, image_url = :image_url WHERE id_event = :id";
        $stmt = $this->pdo->prepare($sql);
        try {
            $result = $stmt->execute([
                ':id_category' => $data['id_category'],
                ':title' => $data['title'],
                ':description' => $data['description'],
                ':event_date' => $data['event_date'],
                ':location' => $data['location'],
                ':image_url' => $data['image_url'],
                ':id' => $eventId
            ]);
            if ($result) {
                return $eventId;
            } else {
                return false;
            }
        } catch (\PDOException $e) {
            return false;
        }
    }

    // Marcar evento como 'terminado' (soft delete)
    public function delete($eventId) {
    // Atualiza o status para 'terminado'.
    $stmt = $this->pdo->prepare("UPDATE events SET status = 'terminado' WHERE id_event = :id");
    $ok = $stmt->execute([':id' => $eventId]);

    return $ok;
    }


}
