<?php
/**
 * Salon Profit Bar - PHP SMTP API Router
 * 
 * Works with:
 * 1. PHP Built-in Server: php -S 0.0.0.0:5005 -t php-smtp index.php
 * 2. Apache / Hostinger cPanel Rewrite Routing
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// If running on PHP built-in server and file actually exists on disk, serve it directly
if (php_sapi_name() === 'cli-server') {
    $file = __DIR__ . $uri;
    if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
        return false;
    }
}

// Normalize URI (strip trailing slashes, remove /php-smtp base if hosted in subfolder)
$normalizedUri = rtrim($uri, '/');
$normalizedUri = preg_replace('#^/php-smtp#', '', $normalizedUri);

// Route: Health check
if ($normalizedUri === '' || $normalizedUri === '/health' || $normalizedUri === '/api/health' || $normalizedUri === '/health.php') {
    require __DIR__ . '/health.php';
    exit;
}

// Route: Send email
if ($normalizedUri === '/send-email' || $normalizedUri === '/api/send-email' || $normalizedUri === '/send-email.php') {
    require __DIR__ . '/send-email.php';
    exit;
}

// Route: Test email runner
if ($normalizedUri === '/test-email' || $normalizedUri === '/test-email.php') {
    require __DIR__ . '/test-email.php';
    exit;
}

// 404 Fallback
require_once __DIR__ . '/config.php';
handleCorsAndHeaders();
sendJsonResponse([
    'success' => false,
    'error'   => "Route not found: {$uri}. Available endpoints: /api/health, /api/send-email, /send-email.php, /health.php"
], 404);
