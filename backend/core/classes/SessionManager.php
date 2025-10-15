<?php
// Classe SessionManager - gere sessões PHP de forma segura

class SessionManager {
    // Inicia a sessão com parâmetros seguros (httponly, secure, samesite)
    public static function start() {
        if (session_status() === PHP_SESSION_NONE) {
            // Definir parâmetros seguros para o cookie de sessão
            $secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
            
            // Aumentar o tempo de vida da sessão para 24 horas
            ini_set('session.gc_maxlifetime', 86400); // 24 horas em segundos
            
            // Configurar os parâmetros do cookie de sessão
            session_set_cookie_params([
                'lifetime' => 86400,
                'path' => '/',
                'domain' => '',
                'secure' => $secure,
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_start();
        }
    }

    // Destroi a sessão e remove o cookie de sessão
    public static function destroy() {
        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION = [];
            if (ini_get('session.use_cookies')) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
            }
            session_destroy();
        }
    }

    // Regenera o ID da sessão para prevenir ataques de fixation
    public static function regenerate() {
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }
    }
}
