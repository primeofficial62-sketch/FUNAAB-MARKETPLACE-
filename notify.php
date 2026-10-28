<?php
require __DIR__ . '/lib.php';
header('Content-Type: application/json');
header('Cache-Control: no-store');

function out($ok, $err = null) { echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $err]); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'POST only');
$in = json_decode(file_get_contents('php://input'), true) ?: [];
$type = $in['type'] ?? '';

// The recipient is ALWAYS the verified Supabase user, never a value sent by the browser.
$u = user_from_token($in['token'] ?? '');
if (!$u) out(false, 'Not signed in');
if (empty($u['email_confirmed_at'])) out(false, 'Email not verified');

$md = $u['user_metadata'] ?? [];
$name = $md['full_name'] ?? $md['name'] ?? explode('@', $u['email'])[0];
$first = explode(' ', trim($name))[0];

// simple throttle: one email of each type per user per minute
$lock = sys_get_temp_dir() . '/kz_' . md5($u['id'] . $type);
if (is_file($lock) && time() - filemtime($lock) < 60) out(false, 'Please wait a minute and try again');
touch($lock);

if ($type === 'welcome_new' || $type === 'welcome_back') {
  $ok = send_mail($u['email'], $type === 'welcome_new' ? 'Welcome to KAMPZA 🧡' : 'Welcome back to KAMPZA 👋', welcome_html($first, $type === 'welcome_back'));
  out($ok, 'Mail provider rejected the message');
}

if ($type === 'digest_test') {
  [, $flash] = load_catalog();
  if (!$flash) out(false, 'No flash deals in deals.json');
  $ok = send_mail($u['email'], "Today's Flash Deals ⚡", digest_html($first, $flash, $u['id']), unsub_url($u['id']));
  out($ok, 'Mail provider rejected the message');
}

out(false, 'Unknown type');
