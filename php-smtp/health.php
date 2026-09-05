<?php
/**
 * Salon Profit Bar - SMTP Service Health & Diagnostics Endpoint
 * 
 * Method: GET
 */

require_once __DIR__ . '/config.php';

// Handle CORS and set JSON header
handleCorsAndHeaders();

$config = getSmtpConfig();
$isConfigured = !empty($config['username']) && !empty($config['password']);

sendJsonResponse([
    'status'         => 'online',
    'service'        => 'Saloon Admin SMTP Server (PHP)',
    'php_version'    => PHP_VERSION,
    'smtpConfigured' => $isConfigured,
    'host'           => $config['host'],
    'port'           => $config['port'],
    'secure'         => $config['secure'],
    'fromEmail'      => $config['from_email'],
    'fromName'       => $config['from_name'],
    'timestamp'      => date('c'),
], 200);
