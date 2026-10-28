<?php
/**
 * KAMPZA daily deals email. Run once a day by cron.
 *   CLI:  0 8 * * *  /usr/bin/php /home/USER/public_html/daily-digest.php
 *   URL:  0 8 * * *  curl -s "https://yourdomain.com/daily-digest.php?key=YOUR_CRON_KEY"
 * Safe to run twice: each user is stamped with last_digest=<date> and skipped on repeat.
 */
require __DIR__ . '/lib.php';
set_time_limit(0);

if (PHP_SAPI !== 'cli') {
  if (!hash_equals($CFG['cron_key'], (string)($_GET['key'] ?? ''))) { http_response_code(403); exit('Forbidden'); }
  header('Content-Type: text/plain');
}

$today = date('Y-m-d');
[, $flash] = load_catalog();
if (!$flash) { echo "No flash deals in deals.json, nothing sent.\n"; exit; }

$page = 1; $sent = 0; $skipped = 0; $failed = 0;
do {
  [$code, $res] = http('GET', $CFG['supabase_url'] . "/auth/v1/admin/users?page=$page&per_page=200", svc_headers());
  if ($code !== 200) { echo "Supabase error $code (check supabase_service key)\n"; exit(1); }
  $users = $res['users'] ?? [];
  foreach ($users as $u) {
    $m = $u['user_metadata'] ?? [];
    if (empty($u['email']) || empty($u['email_confirmed_at']) || ($m['email_daily'] ?? true) === false || ($m['last_digest'] ?? '') === $today) { $skipped++; continue; }
    $name = explode(' ', trim($m['full_name'] ?? $m['name'] ?? explode('@', $u['email'])[0]))[0];
    if (send_mail($u['email'], "Today's Flash Deals ⚡", digest_html($name, $flash, $u['id']), unsub_url($u['id']))) {
      update_user_meta($u['id'], ['last_digest' => $today]);
      $sent++;
    } else { $failed++; }
    usleep(600000); // stay under provider rate limit (2 emails/second)
  }
  $page++;
} while (count($users) === 200);

echo "Done $today. Sent $sent, skipped $skipped, failed $failed.\n";
