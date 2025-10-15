<?php

// Carregar o autoload do Composer (se existir)
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

// Carregar as variáveis de ambiente do ficheiro .env (se o Dotenv estiver disponível)
if (class_exists('Dotenv\Dotenv')) {
    try {
        $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->load();
    } catch (Exception $e) {
        // Log de erro se não for possível carregar o .env
        error_log("Aviso: Não foi possível carregar .env: " . $e->getMessage());
    }
}

// Configurar os cabeçalhos de CORS para permitir pedidos do frontend React
if (php_sapi_name() !== 'cli') {
    
    // Configurar CORS corretamente para desenvolvimento
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $allowed_origins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
    } else {
        header('Access-Control-Allow-Origin: http://localhost:3000');
        header('Access-Control-Allow-Credentials: true');
    }
    
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    
    // Responder imediatamente a pedidos OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
