<?php
/**
 * Salon Profit Bar - PHP SMTP Configuration & Helper Utilities
 * 
 * Supports:
 * 1. Automatic loading of .env file (either in php-smtp/ or parent root /)
 * 2. System environment variables (getenv / $_ENV)
 * 3. Direct overrides in this file for easy cPanel setup
 */

// 1. Load Composer Autoloader if present
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
}

// 2. Simple lightweight .env parser
function loadEnvFile($filePath) {
    if (!file_exists($filePath) || !is_readable($filePath)) {
        return false;
    }
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            // Remove surrounding quotes if present
            if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                $val = substr($val, 1, -1);
            }
            if (!isset($_ENV[$key]) && getenv($key) === false) {
                putenv("{$key}={$val}");
                $_ENV[$key] = $val;
            }
        }
    }
    return true;
}

// Check local .env first, then root .env
loadEnvFile(__DIR__ . '/.env');
loadEnvFile(dirname(__DIR__) . '/.env');

// Helper to get environment variable with fallback
function env($key, $default = null) {
    $val = getenv($key);
    if ($val !== false) {
        return $val;
    }
    if (isset($_ENV[$key])) {
        return $_ENV[$key];
    }
    if (isset($_SERVER[$key])) {
        return $_SERVER[$key];
    }
    return $default;
}

// 3. Return Configuration Array
function getSmtpConfig() {
    $port = (int) env('SMTP_PORT', 465);
    $secureEnv = env('SMTP_SECURE', 'true');
    
    // Determine secure mode for PHPMailer
    $secure = false;
    if ($secureEnv === 'true' || $secureEnv === '1' || $port === 465) {
        $secure = 'ssl';
    } elseif ($secureEnv === 'tls' || $port === 587) {
        $secure = 'tls';
    }

    return [
        'host' => env('SMTP_HOST', 'smtp.resend.com'),
        'port' => $port,
        'secure' => $secure,
        'auth' => true,
        'username' => env('SMTP_USER', 'resend'),
        'password' => env('SMTP_PASS', ''),
        'from_email' => env('SMTP_FROM_EMAIL', 'welcome@salonprofitbar.com'),
        'from_name' => env('SMTP_FROM_NAME', 'Salon Profit Bar'),
        'cors_origins' => ['*'], // Can be restricted to specific domain on production
    ];
}

// 4. Send CORS and JSON headers
function handleCorsAndHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

    // Handle CORS preflight request
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    header('Content-Type: application/json; charset=utf-8');
}

// 5. Send JSON response helper
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
