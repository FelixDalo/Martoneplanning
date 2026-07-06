<?php
/**
 * contact.php — Martone Planning Studio contact form handler
 * Hostinger shared hosting. Requires contact-config.php (see contact-config.php.example).
 * Sends internal notification via Resend REST API immediately;
 * schedules autoresponder ~40 seconds later using Resend scheduledAt.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Load credentials
$config = __DIR__ . '/contact-config.php';
if (!file_exists($config)) {
    error_log('contact.php: contact-config.php not found');
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error. Please contact us directly.']);
    exit;
}
require $config;

// Parse JSON body
$raw  = (string) file_get_contents('php://input');
$body = json_decode($raw, true);

if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request.']);
    exit;
}

/** @param string $s */
function esc(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Honeypot — bots fill hidden fields; real users leave it empty. Silently succeed.
if (!empty($body['_honeypot'])) {
    http_response_code(200);
    echo json_encode(['ok' => true]);
    exit;
}

// Time-to-submit guard — reject submissions faster than a human can type (< 3 s).
if (!empty($body['_startedAt'])) {
    $elapsed_ms = (microtime(true) * 1000) - (float) $body['_startedAt'];
    if ($elapsed_ms < 3000) {
        http_response_code(429);
        echo json_encode(['error' => 'Submission too fast. Please try again.']);
        exit;
    }
}

// Sanitise and validate fields
$name    = trim((string) ($body['name']    ?? ''));
$phone   = trim((string) ($body['phone']   ?? ''));
$email   = trim((string) ($body['email']   ?? ''));
$message = trim((string) ($body['message'] ?? ''));

$errors = [];

if (strlen($name) < 2) {
    $errors[] = ['field' => 'name', 'message' => 'Name must be at least 2 characters.'];
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = ['field' => 'email', 'message' => 'Please enter a valid email address.'];
}
if (strlen(preg_replace('/[\s\-().+]/', '', $phone) ?: '') < 5) {
    $errors[] = ['field' => 'phone', 'message' => 'Please enter a valid phone number.'];
}
if (strlen($message) < 10) {
    $errors[] = ['field' => 'message', 'message' => 'Message must be at least 10 characters.'];
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['errors' => $errors]);
    exit;
}

/**
 * Send one email via the Resend REST API.
 *
 * @param array<string, mixed> $payload
 * @return array{code: int, body: string}
 */
function resend_send(array $payload): array
{
    $ch = curl_init('https://api.resend.com/emails');
    if ($ch === false) {
        return ['code' => 0, 'body' => 'curl_init failed'];
    }
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . RESEND_API_KEY,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS     => (string) json_encode($payload),
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $response  = (string) curl_exec($ch);
    $http_code = (int)    curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $http_code, 'body' => $response];
}

$first_name = explode(' ', $name)[0];

$notification_html = '<h2>New enquiry from ' . esc($name) . '</h2>
<p><strong>Name:</strong> '    . esc($name)    . '</p>
<p><strong>Phone:</strong> '   . esc($phone)   . '</p>
<p><strong>Email:</strong> '   . esc($email)   . '</p>
<p><strong>Message:</strong></p>
<p style="white-space:pre-wrap">' . esc($message) . '</p>';

$autoresponder_html = '<p>Dear ' . esc($first_name) . ',</p>
<p>Thank you for getting in touch with Martone Planning Studio. We have received your enquiry and will review the details you shared.</p>
<p>A member of our team will contact you to discuss the next step.</p>
<p>Best regards,<br>Martone Planning Studio<br>Gaborone, Botswana</p>';

// 1. Internal notification — sent immediately.
$notify = resend_send([
    'from'     => CONTACT_FROM_EMAIL,
    'to'       => [CONTACT_TO_EMAIL],
    'reply_to' => $email,
    'subject'  => 'New enquiry from ' . $name,
    'html'     => $notification_html,
]);

if ($notify['code'] < 200 || $notify['code'] >= 300) {
    error_log('contact.php: notification failed (HTTP ' . $notify['code'] . '): ' . $notify['body']);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to submit. Please try again.']);
    exit;
}

// 2. Autoresponder — scheduled ~AUTORESPONDER_DELAY_SECONDS seconds later.
//    Resend accepts ISO 8601 timestamps in the scheduled_at field.
$delay       = defined('AUTORESPONDER_DELAY_SECONDS') ? (int) AUTORESPONDER_DELAY_SECONDS : 40;
$schedule_at = (new DateTimeImmutable('+' . $delay . ' seconds'))->format(DateTimeInterface::ATOM);

$auto = resend_send([
    'from'         => AUTORESPONDER_FROM_EMAIL,
    'to'           => [$email],
    'subject'      => 'Thank you for contacting Martone Planning Studio',
    'html'         => $autoresponder_html,
    'scheduled_at' => $schedule_at,
]);

if ($auto['code'] < 200 || $auto['code'] >= 300) {
    // Non-fatal: notification already sent successfully.
    error_log('contact.php: autoresponder schedule failed (HTTP ' . $auto['code'] . '): ' . $auto['body']);
}

http_response_code(200);
echo json_encode(['ok' => true]);
