<?php
$CFG = require __DIR__ . '/config.php';
date_default_timezone_set($CFG['tz']);

function http($method, $url, $headers = [], $body = null) {
  $c = curl_init($url);
  curl_setopt_array($c, [CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 25]);
  if ($body !== null) curl_setopt($c, CURLOPT_POSTFIELDS, is_string($body) ? $body : json_encode($body));
  $r = curl_exec($c);
  $code = curl_getinfo($c, CURLINFO_HTTP_CODE);
  curl_close($c);
  return [$code, json_decode((string)$r, true)];
}

function svc_headers() {
  global $CFG;
  return ['apikey: ' . $CFG['supabase_service'], 'Authorization: Bearer ' . $CFG['supabase_service'], 'Content-Type: application/json'];
}

/** Verify a user's access token with Supabase and return the user (or null). */
function user_from_token($token) {
  global $CFG;
  if (!$token) return null;
  [$code, $u] = http('GET', $CFG['supabase_url'] . '/auth/v1/user', ['apikey: ' . $CFG['supabase_anon'], 'Authorization: Bearer ' . $token]);
  return ($code === 200 && !empty($u['id'])) ? $u : null;
}

/** Merge keys into a user's user_metadata. */
function update_user_meta($id, $meta) {
  global $CFG;
  [$code] = http('PUT', $CFG['supabase_url'] . '/auth/v1/admin/users/' . $id, svc_headers(), ['user_metadata' => $meta]);
  return $code === 200;
}

function unsub_token($id) {
  global $CFG;
  return hash_hmac('sha256', $id, $CFG['secret']);
}
function unsub_url($id) {
  global $CFG;
  return $CFG['base_url'] . '/unsubscribe.php?u=' . urlencode($id) . '&t=' . unsub_token($id);
}

function send_mail($to, $subject, $html, $unsub = null) {
  global $CFG;
  if ($CFG['mail_driver'] === 'resend') {
    $payload = ['from' => $CFG['mail_from'], 'to' => [$to], 'subject' => $subject, 'html' => $html];
    if ($unsub) $payload['headers'] = ['List-Unsubscribe' => '<' . $unsub . '>', 'List-Unsubscribe-Post' => 'List-Unsubscribe=One-Click'];
    [$code, $r] = http('POST', 'https://api.resend.com/emails', ['Authorization: Bearer ' . $CFG['resend_key'], 'Content-Type: application/json'], $payload);
    if ($code < 200 || $code >= 300) error_log('KAMPZA mail error ' . $code . ' ' . json_encode($r));
    return $code >= 200 && $code < 300;
  }
  $h = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: " . $CFG['mail_from'] . "\r\n";
  if ($unsub) $h .= 'List-Unsubscribe: <' . $unsub . ">\r\n";
  return mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, $h);
}

/** Same deals.json the website reads. Returns [productsById, flashProducts]. */
function load_catalog() {
  $j = json_decode((string)@file_get_contents(__DIR__ . '/deals.json'), true);
  $by = [];
  foreach (($j['products'] ?? []) as $p) $by[$p['id']] = $p;
  $flash = [];
  foreach (($j['flash'] ?? []) as $id) if (isset($by[$id])) $flash[] = $by[$id];
  return [$by, $flash];
}

function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function naira($n) { return '₦' . number_format((float)$n); }

function wrap_email($inner, $unsub = null) {
  global $CFG;
  $foot = $unsub ? '<a href="' . h($unsub) . '" style="color:#888">Unsubscribe from daily emails</a>' : 'KAMPZA';
  return '<!doctype html><html><body style="margin:0;background:#F4F4F4;font-family:Arial,Helvetica,sans-serif;color:#252525">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:16px">'
    . '<table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:14px;overflow:hidden" cellpadding="0" cellspacing="0">'
    . '<tr><td style="background:#252525;padding:18px 20px;font-size:22px;font-weight:700;color:#fff">KAMP<span style="color:#FF7628">ZA</span></td></tr>'
    . '<tr><td style="padding:22px 20px">' . $inner . '</td></tr></table>'
    . '<p style="font-size:12px;color:#888;margin:14px 0 0">' . $foot . '<br>Find It. Get It. Love It.</p>'
    . '</td></tr></table></body></html>';
}

function welcome_html($name, $returning) {
  global $CFG;
  $t = $returning ? 'Welcome back, ' . h($name) . ' 👋' : 'Welcome to KAMPZA, ' . h($name) . ' 🧡';
  $m = $returning ? 'Good to see you again. New campus deals are waiting.' : 'Your account is ready. Find campus essentials, tech and fashion in one place.';
  return wrap_email('<h2 style="margin:0 0 8px">' . $t . '</h2><p style="line-height:1.5">' . $m . '</p>'
    . '<p><a href="' . h($CFG['site_url']) . '" style="display:inline-block;background:#FF7628;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">Start shopping</a></p>');
}

function digest_html($name, $flash, $uid) {
  global $CFG;
  $rows = '';
  foreach ($flash as $p) {
    $d = (!empty($p['o']) && $p['o'] > $p['p']) ? round((1 - $p['p'] / $p['o']) * 100) : 0;
    $pic = (!empty($p['img']) && preg_match('~^https?://~', $p['img']))
      ? '<img src="' . h($p['img']) . '" width="64" height="64" alt="" style="object-fit:contain;border-radius:10px;background:#F4F4F4">'
      : '<div style="width:64px;height:64px;line-height:64px;text-align:center;font-size:30px;border-radius:10px;background:#F4F4F4">' . h($p['e'] ?? '🛍️') . '</div>';
    $rows .= '<tr><td width="76" style="padding:8px 0">' . $pic . '</td><td style="padding:8px 0 8px 8px"><b>' . h($p['n']) . '</b><br>'
      . '<span style="font-weight:700">' . naira($p['p']) . '</span>'
      . ($d ? ' <s style="color:#888;font-size:12px">' . naira($p['o']) . '</s> <span style="color:#FF7628;font-weight:700;font-size:12px">-' . $d . '%</span>' : '')
      . '</td></tr>';
  }
  $inner = '<h2 style="margin:0 0 4px">Today’s Flash Deals ⚡</h2><p style="margin:0 0 10px;color:#6b6b6b">Hi ' . h($name) . ', here are today’s price drops.</p>'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $rows . '</table>'
    . '<p style="margin-top:16px"><a href="' . h($CFG['site_url']) . '" style="display:inline-block;background:#FF7628;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">Shop deals</a></p>';
  return wrap_email($inner, unsub_url($uid));
}
