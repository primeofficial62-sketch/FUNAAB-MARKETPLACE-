<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$BREVO_KEY = 'YOUR_BREVO_API_KEY';
$FROM = ['name' => 'KAMPZA Store', 'email' => 'kampzastore@gmail.com'];

$in    = json_decode(file_get_contents('php://input'), true) ?: [];
$type  = $in['type'] ?? '';
$email = filter_var($in['email'] ?? '', FILTER_VALIDATE_EMAIL);
$name  = htmlspecialchars($in['name'] ?? 'there');

if (!$email) { http_response_code(400); echo json_encode(['error' => 'Invalid email']); exit; }

function wrap($body) {
  return '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
    <div style="background:#111;padding:20px;text-align:center;color:#fff;font-size:22px;font-weight:bold">KAMPZA</div>
    <div style="padding:24px;color:#333;line-height:1.6">'.$body.'</div>
    <div style="background:#f7f7f7;padding:14px;text-align:center;font-size:12px;color:#888">
      Find It. Get It. Love It.<br>kampzastore@gmail.com · WhatsApp 09059538257
    </div></div>';
}

if ($type === 'welcome') {
  $subject = "Welcome to KAMPZA, $name!";
  $html = wrap("<h2>Welcome, $name 🎉</h2>
    <p>Your account is ready. Browse categories, grab daily deals and shop with ease.</p>
    <p>Need help? Reply to this email or chat us on WhatsApp.</p>");
} else {
  http_response_code(400); echo json_encode(['error' => 'Unknown type']); exit;
}

$ch = curl_init('https://api.brevo.com/v3/smtp/email');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ['api-key: '.$BREVO_KEY, 'Content-Type: application/json', 'accept: application/json'],
  CURLOPT_POSTFIELDS => json_encode([
    'sender' => $FROM,
    'to' => [['email' => $email, 'name' => $name]],
    'subject' => $subject,
    'htmlContent' => $html,
  ]),
]);
$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($code >= 200 && $code < 300 ? 200 : 500);
echo $res ?: json_encode(['error' => 'Send failed']);