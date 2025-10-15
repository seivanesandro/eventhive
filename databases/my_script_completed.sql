-- cria DATABSE eventhive_db

-- Garante que o event scheduler está ativo para os EVENTs funcionarem
SET GLOBAL event_scheduler = ON;

CREATE DATABASE IF NOT EXISTS eventhive_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- utiliza a DATABASE eventhive_db 
USE eventhive_db;



-- Tabela roles: armazena os tipos de permissão dos utilizadores.
CREATE TABLE `roles` (
  `id_role` INT NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_role`),
  UNIQUE INDEX `role_name_UNIQUE` (`role_name` ASC));
-- Chave Primária (PK): id_role.





-- Tabela users: armazena as informações dos utilizadores registados.
CREATE TABLE `users` (
  `id_user` INT NOT NULL AUTO_INCREMENT,
  `id_role` INT NOT NULL DEFAULT 2,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1, -- 1=ativo, 0=desativado. Utilizadores desativados não podem aceder ao sistema, mas o histórico é preservado.
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  INDEX `fk_users_roles_idx` (`id_role` ASC),
  CONSTRAINT `fk_users_roles`
    FOREIGN KEY (`id_role`)
    REFERENCES `roles` (`id_role`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);
-- Chave Primária (PK): id_user.
-- Chave Estrangeira (FK): id_role -> aponta para a tabela roles(id_role).




-- Tabela categories: armazena as categorias dos eventos.
CREATE TABLE `categories` (
  `id_category` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_category`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC));
-- Chave Primária (PK): id_category.



-- Tabela events: armazena a informação detalhada de cada evento.
CREATE TABLE `events` (
  `id_event` INT NOT NULL AUTO_INCREMENT,
  `id_category` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `event_date` DATETIME NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `image_url` VARCHAR(255) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'ativo', -- status do evento ('ativo', 'terminado')
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_event`),
  INDEX `fk_events_categories_idx` (`id_category` ASC),
  CONSTRAINT `fk_events_categories`
    FOREIGN KEY (`id_category`)
    REFERENCES `categories` (`id_category`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);




-- Tabela tickets: armazena os tipos de bilhete para cada evento.
CREATE TABLE `tickets` (
  `id_ticket` INT NOT NULL AUTO_INCREMENT,
  `id_event` INT NOT NULL,
  `ticket_type` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity_available` INT NOT NULL,
  PRIMARY KEY (`id_ticket`),
  INDEX `fk_tickets_events_idx` (`id_event` ASC),
  CONSTRAINT `fk_tickets_events`
    FOREIGN KEY (`id_event`)
    REFERENCES `events` (`id_event`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

-- Chave Primária (PK): id_ticket.
-- Chave Estrangeira (FK): id_event -> aponta para a tabela events(id_event).




-- Tabela orders: armazena o cabeçalho de cada transação.
CREATE TABLE `orders` (
  `id_order` INT NOT NULL AUTO_INCREMENT,
  `id_user` INT NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `order_date` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(50) NULL DEFAULT 'Completed',
  PRIMARY KEY (`id_order`),
  INDEX `fk_orders_users_idx` (`id_user` ASC),
  CONSTRAINT `fk_orders_users`
    FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);
-- Chave Primária (PK): id_order.
-- Chave Estrangeira (FK): id_user -> aponta para a tabela users(id_user).




-- Tabela order_items: armazena as linhas de detalhe de cada transação.
CREATE TABLE `order_items` (
  `id_order_item` INT NOT NULL AUTO_INCREMENT,
  `id_order` INT NOT NULL,
  `id_ticket` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price_per_ticket` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id_order_item`),
  INDEX `fk_order_items_orders_idx` (`id_order` ASC),
  INDEX `fk_order_items_tickets_idx` (`id_ticket` ASC),
  CONSTRAINT `fk_order_items_orders`
    FOREIGN KEY (`id_order`)
    REFERENCES `orders` (`id_order`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_tickets`
    FOREIGN KEY (`id_ticket`)
    REFERENCES `tickets` (`id_ticket`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);
-- Chave Primária (PK): id_order_item.
-- Chave Estrangeira (FK): id_order -> aponta para a tabela orders(id_order).
-- Chave Estrangeira (FK): id_ticket -> aponta para a tabela tickets(id_ticket).





CREATE TABLE `activity_logs` (
  `id_log` INT NOT NULL AUTO_INCREMENT,
  `id_user` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  FOREIGN KEY (`id_user`) REFERENCES users(id_user)
);
-- Chave Primária (PK): id_log.
-- Chave Estrangeira (FK): id_user -> aponta para a tabela users(id_user).



-- Uma `VIEW` para simplificar consultas futuras no PHP
CREATE OR REPLACE VIEW vw_event_details AS
SELECT
    e.id_event,
    e.title,
    e.description,
    e.event_date,
    e.location,
    e.image_url,
    c.name AS category_name
FROM
    events AS e
JOIN
    categories AS c ON e.id_category = c.id_category;
    
    
    

-- TRIGGER para atualizar o stock de bilhetes após compra
DELIMITER $$
CREATE TRIGGER trg_after_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE tickets
    SET quantity_available = quantity_available - NEW.quantity
    WHERE id_ticket = NEW.id_ticket;
END$$
DELIMITER ;



-- Inserção de dados essenciais
INSERT INTO roles (id_role, role_name) VALUES (1, 'admin'), (2, 'customer');

INSERT INTO categories (id_category, name) VALUES (1, 'Música'), (2, 'Desporto'), (3, 'Teatro'), (4, 'Conferências');

INSERT INTO users (id_user, id_role, first_name, last_name, email, password_hash, active) VALUES
    (1, 1, 'Admin', 'User', 'admin@eventhive.com', '$2y$10$5UlNLosjVtH7v9fGHs7bgu1N6b2XKAL/pYjd.GnuRsJ0H2AQvV.su', 1),
    (2, 2, 'Cliente', 'Exemplo', 'cliente@eventhive.com', '$2y$10$5UlNLosjVtH7v9fGHs7bgu1N6b2XKAL/pYjd.GnuRsJ0H2AQvV.su', 1);



-- Inserção de dados em todos os objectos

-- Inserção de dados para os eventos
INSERT INTO events (id_event, id_category, title, description, event_date, location, image_url, status) VALUES
  (1, 1, 'Concerto Acústico de Verão', 'Uma noite mágica com os melhores artistas nacionais.', '2025-08-15 21:00:00', 'Jardim da Estrela, Lisboa', 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg', 'ativo'),
  (2, 2, 'Final da Taça de Futsal', 'A grande final da taça de futsal. Um jogo emocionante!', '2025-09-05 18:30:00', 'Pavilhão Atlântico, Lisboa', 'https://images.pexels.com/photos/1263426/pexels-photo-1263426.jpeg', 'ativo'),
  (3, 3, 'Peça Clássica: "Os Maias"', 'Uma adaptação moderna da obra-prima de Eça de Queirós.', '2025-10-10 20:00:00', 'Teatro Nacional D. Maria II, Lisboa', 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg', 'ativo'),
  (4, 4, 'Web Summit 2025', 'A maior conferência de tecnologia e inovação do mundo, em Lisboa.', '2025-11-11 09:00:00', 'Altice Arena & FIL, Lisboa', 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg', 'ativo'),
  (5, 1, 'Festival Paredes de Coura', 'O icónico festival de música alternativa está de volta com um cartaz imperdível.', '2025-08-20 16:00:00', 'Praia Fluvial do Taboão, Paredes de Coura', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg', 'ativo'),
  (6, 2, 'Maratona de Lisboa EDP', 'Participe na corrida mais bonita do mundo, com partida em Cascais e meta na Praça do Comércio.', '2025-10-12 08:00:00', 'Lisboa-Cascais', 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&w=400&q=80', 'ativo'),
  (7, 3, 'Stand-up com Ricardo Araújo Pereira', 'Uma noite de humor inteligente e observações mordazes com um dos maiores comediantes de Portugal.', '2025-09-26 21:30:00', 'Coliseu dos Recreios, Lisboa', 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg', 'ativo');


-- Inserção de todos os bilhetes
INSERT INTO tickets (id_ticket, id_event, ticket_type, price, quantity_available) VALUES
    (1, 1, 'Bilhete Normal', 25.00, 200),
    (2, 1, 'Bilhete VIP', 50.00, 50),
    (3, 2, 'Bancada Central', 35.00, 500),
    (4, 3, 'Plateia', 20.00, 150),
    (5, 4, 'Passe Geral 3 Dias', 750.00, 5000),
    (6, 5, 'Passe 4 Dias', 120.00, 10000),
    (7, 5, 'Bilhete Diário', 55.00, 2000),
    (8, 6, 'Inscrição Maratona (42km)', 60.00, 3000),
    (9, 7, '1ª Plateia', 30.00, 400),
    (10, 7, '2ª Plateia', 25.00, 600);

-- Inserção da compra de exemplo
INSERT INTO orders (id_order, id_user, total_price, status) VALUES (1, 2, 100.00, 'Completed');
INSERT INTO order_items (id_order_item, id_order, id_ticket, quantity, price_per_ticket) VALUES
    (1, 1, 1, 2, 25.00),
    (2, 1, 2, 1, 50.00);
INSERT INTO activity_logs(id_log, id_user, action, description, ip_address, created_at) VALUES (1, 2, 'login_TEST', 'TESTE DE INSERT - Utilizador autenticado com sucesso.', '127.0.0.1', NOW());



