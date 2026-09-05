<?php
/**
 * Salon Profit Bar - SMTP Diagnostic Test Runner
 * 
 * Usage via CLI:
 *   php test-email.php recipient@example.com
 * 
 * Usage via Browser (Dev / Diagnostic mode):
 *   http://localhost:5005/test-email.php?to=recipient@example.com
 */

require_once __DIR__ . '/config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

handleCorsAndHeaders();

// Determine recipient
$recipient = null;
if (php_sapi_name() === 'cli') {
    $recipient = $argv[1] ?? null;
} else {
    $recipient = $_GET['to'] ?? null;
}

if (!$recipient || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse([
        'success' => false,
        'error'   => 'Please provide a valid recipient email. Example: ?to=your-email@example.com or "php test-email.php your-email@example.com"'
    ], 400);
}

$config = getSmtpConfig();

$mail = new PHPMailer(true);

try {
    // Enable debug output if in CLI mode
    if (php_sapi_name() === 'cli') {
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    }

    $mail->isSMTP();
    $mail->Host       = $config['host'];
    $mail->SMTPAuth   = $config['auth'];
    $mail->Username   = $config['username'];
    $mail->Password   = $config['password'];
    $mail->Port       = $config['port'];
    $mail->CharSet    = 'UTF-8';

    if ($config['secure'] === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($config['secure'] === 'tls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPSecure = false;
        $mail->SMTPAutoTLS = false;
    }

    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ],
    ];

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress($recipient);

    $mail->isHTML(true);
    $mail->Subject = 'Salon Profit Bar - SMTP Diagnostic Test';
    $mail->Body    = '<h2>Test Email Successful!</h2><p>This is a test notification verifying that your PHP SMTP backend is correctly configured and communicating with your mail provider.</p><p>Sent at: ' . date('Y-m-d H:i:s') . '</p>';
    $mail->AltBody = "Test Email Successful!\nSent at: " . date('Y-m-d H:i:s');

    $mail->send();

    sendJsonResponse([
        'success'   => true,
        'message'   => "Test email dispatched successfully to {$recipient}",
        'messageId' => $mail->getLastMessageID(),
    ], 200);

} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'error'   => 'PHPMailer Test Failed: ' . $mail->ErrorInfo ?: $e->getMessage()
    ], 500);
} catch (\Throwable $t) {
    sendJsonResponse([
        'success' => false,
        'error'   => 'Server Error: ' . $t->getMessage()
    ], 500);
}
