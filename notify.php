<?php
// KAMPZA email endpoint. Upload next to store.html.
// Types: welcome_new, welcome_back, order, update (user-triggered); broadcast (admin only).
header('Content-Type: application/json');
$CFG = ['from' => 'no-reply@yourdomain.com', 'name' => 'KAMPZA', 'admin_key' => 'CHANGE_THIS_SECRET', 'subs' => __DIR__ . '/subscribers.txt'];

$d = json_decode(file_get_contents('php://input'), true) ?: [];
$type = $d['type'] ?? '';
$name = htmlspecialchars($d['name'] ?? 'there', ENT_QUOTES);

// An email counts as "active" only if it is valid and its domain has mail (MX) records.
function active($e) { return $e && filter_var($e, FILTER_VALIDATE_EMAIL) && checkdnsrr(substr(strrchr($e, '@'), 1), 'MX'); }
function send($to, $subject, $body) {
  global $CFG;
  $h = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: {$CFG['name']} <{$CFG['from']}>\r\n";
  $html = "<div style='font-family:Arial,sans-serif;max-width:520px;margin:auto'><h2 style='color:#FF7628'>KAMPZA</h2>$body<p style='color:#888;font-size:12px'>Find It. Get It. Love It.</p></div>";
  return mail($to, $subject, $html, $h);
}
function subscribers() { global $CFG; return file_exists($CFG['subs']) ? array_filter(array_map('trim', file($CFG['subs']))) : []; }

if ($type === 'broadcast') {                       // POST {type:"broadcast", key:"...", subject:"...", message:"..."}
  if (($d['key'] ?? '') !== $CFG['admin_key']) { http_response_code(403); exit(json_encode(['ok' => false, 'error' => 'forbidden'])); }
  $sent = 0; $skipped = 0;
  foreach (array_unique(subscribers()) as $e) {
    if (!active($e)) { $skipped++; continue; }
    $sent += send($e, $d['subject'] ?? 'News from KAMPZA', '<p>' . nl2br(htmlspecialchars($d['message'] ?? '')) . '</p>') ? 1 : 0;
  }
  exit(json_encode(['ok' => true, 'sent' => $sent, 'skipped_inactive' => $skipped]));
}

$email = filter_var($d['email'] ?? '', FILTER_VALIDATE_EMAIL);
if (!active($email)) exit(json_encode(['ok' => false, 'error' => 'inactive_email']));

// Opt-in list for future updates; remove address when the user opts out.
$list = subscribers();
if (!empty($d['optin'])) { if (!in_array($email, $list)) file_put_contents($CFG['subs'], $email . "\n", FILE_APPEND | LOCK_EX); }
else file_put_contents($CFG['subs'], implode("\n", array_diff($list, [$email])) . "\n", LOCK_EX);

switch ($type) {
  case 'welcome_new':
    $ok = send($email, 'Welcome to KAMPZA 🎉', "<p>Hi $name,</p><p>Your account is ready. Discover campus essentials, flash deals and more.</p>"); break;
  case 'welcome_back':
    $ok = send($email, 'Welcome back to KAMPZA', "<p>Hi $name, you just signed in. If this wasn't you, please change your password.</p>"); break;
  case 'order':
    $ref = htmlspecialchars($d['order'] ?? ''); $tot = number_format((float)($d['total'] ?? 0));
    $ok = send($email, "We received your order $ref", "<p>Hi $name,</p><p>Order <b>$ref</b> (₦$tot) is being processed. Payment status will be confirmed separately.</p>"); break;
  default: exit(json_encode(['ok' => false, 'error' => 'unknown_type']));
}
echo json_encode(['ok' => (bool)$ok, 'error' => $ok ? null : 'mail_failed']);
