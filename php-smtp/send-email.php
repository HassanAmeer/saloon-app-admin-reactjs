<?php
/**
 * Salon Profit Bar - Send Email API Endpoint
 * 
 * Method: POST
 * Content-Type: application/json
 * Payload: {
 *   "to": "recipient@example.com" | ["user1@example.com", "user2@example.com"],
 *   "subject": "Email Subject",
 *   "html": "<h1>HTML Email Body</h1>",
 *   "text": "Optional Plain Text Body"
 * }
 */

require_once __DIR__ . '/config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// 1. Handle CORS and set JSON header
handleCorsAndHeaders();

// 2. Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse([
        'success' => false,
        'error' => 'Method not allowed. Use POST to dispatch emails.'
    ], 405);
}

// 3. Read and parse incoming JSON payload
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    sendJsonResponse([
        'success' => false,
        'error' => 'Invalid JSON payload received.'
    ], 400);
}

$to = $data['to'] ?? null;
$subject = trim($data['subject'] ?? '');
$html = trim($data['html'] ?? '');
$text = $data['text'] ?? null;

if (empty($to) || empty($subject) || empty($html)) {
    sendJsonResponse([
        'success' => false,
        'error' => 'Missing required parameters: to, subject, and html are required.'
    ], 400);
}

// 4. Retrieve SMTP Configuration
$config = getSmtpConfig();

if (empty($config['username']) || empty($config['password'])) {
    sendJsonResponse([
        'success' => false,
        'error' => 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env or config.php.'
    ], 500);
}

// 5. Initialize PHPMailer
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = $config['host'];
    $mail->SMTPAuth   = $config['auth'];
    $mail->Username   = $config['username'];
    $mail->Password   = $config['password'];
    $mail->Port       = $config['port'];
    $mail->CharSet    = 'UTF-8';

    // Encryption settings
    if ($config['secure'] === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($config['secure'] === 'tls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPSecure = false;
        $mail->SMTPAutoTLS = false;
    }

    // SSL options for high compatibility with Hostinger / cPanel mail servers
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ],
    ];

    // Sender
    $mail->setFrom($config['from_email'], $config['from_name']);

    // Recipients
    $recipients = is_array($to) ? $to : [$to];
    $validRecipientCount = 0;

    foreach ($recipients as $recipient) {
        $cleanEmail = trim($recipient);
        if (filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
            $mail->addAddress($cleanEmail);
            $validRecipientCount++;
        }
    }

    if ($validRecipientCount === 0) {
        sendJsonResponse([
            'success' => false,
            'error' => 'No valid recipient email address found in the request.'
        ], 400);
    }

    // Content
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $html;
    $mail->AltBody = !empty($text) ? $text : strip_tags($html);

    // Send email
    $mail->send();
    $messageId = $mail->getLastMessageID() ?: ('<' . uniqid('msg_', true) . '@' . parse_url($config['host'], PHP_URL_HOST) . '>');

    sendJsonResponse([
        'success'   => true,
        'messageId' => $messageId,
        'message'   => 'Email successfully dispatched via SMTP.'
    ], 200);

} catch (Exception $e) {
    sendJsonResponse([
        'success' => false,
        'error'   => 'PHPMailer Error: ' . $mail->ErrorInfo ?: $e->getMessage()
    ], 500);
} catch (\Throwable $t) {
    sendJsonResponse([
        'success' => false,
        'error'   => 'Server Error: ' . $t->getMessage()
    ], 500);
}
