<?php
// Protect from public access: only run via cron or with ?key=SECRET
$SECRET = 'CHANGE_THIS_SECRET';
if (php_sapi_name() !== 'cli' && ($_GET['key'] ?? '') !== $SECRET) { http_response_code(403); exit('Forbidden'); }

$SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
$SERVICE_KEY  = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // keep server-side only, never in HTML
$BREVO_KEY    = 'YOUR_BREVO_API_KEY';
$SITE_URL     = 'https://YOUR_KAMPZA_SITE';

function api($url, $headers, $body = null) {
  $ch = curl_init($url);
  $opts = [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $headers];
  if ($body !== null) { $opts[CURLOPT_POST] = true; $opts[CURLOPT_POSTFIELDS] = json_encode($body); }
  curl_setopt_array($ch, $opts);
  $res = curl_exec($ch); curl_close($ch);
  return json_decode($res, true);
}

$sb = ['apikey: '.$SERVICE_KEY, 'Authorization: Bearer '.$SERVICE_KEY];

// 1. Get today's deals (adjust table/columns to match yours)
$deals = api("$SUPABASE_URL/rest/v1/products?is_deal=eq.true&select=name,price,old_price,image_url&limit=6", $sb);
if (!$deals || isset($deals['message'])) exit('No deals found / query error');

// 2. Build email
$cards = '';
foreach ($deals as $d) {
  $name  = htmlspecialchars($d['name']);
  $price = number_format($d['price']);
  $old   = !empty($d['old_price']) ? '<s style="color:#999;font-size:12px">₦'.number_format($d['old_price']).'</s> ' : '';
  $img   = htmlspecialchars($d['image_url'] ?? '');
  $cards .= "<td style='width:50%;padding:8px;vertical-align:top'>
    <img src='$img' style='width:100%;border-radius:8px'>
    <div style='font-size:14px;margin-top:6px'>$name</div>
    <div style='font-weight:bold'>$old ₦$price</div></td>";
  if (++$i % 2 === 0) $cards .= '</tr><tr>';
}
$html = '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
  <div style="background:#111;padding:20px;text-align:center;color:#fff;font-size:22px;font-weight:bold">KAMPZA</div>
  <div style="padding:20px"><h2 style="margin-top:0">🔥 Today\'s Deals</h2>
  <table width="100%"><tr>'.$cards.'</tr></table>
  <p style="text-align:center"><a href="'.$SITE_URL.'" style="background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Shop Now</a></p></div>
  <div style="background:#f7f7f7;padding:14px;text-align:center;font-size:12px;color:#888">
  Find It. Get It. Love It.<br>kampzastore@gmail.com · WhatsApp 09059538257</div></div>';

// 3. Get all users
$sent = 0; $page = 1;
do {
  $res = api("$SUPABASE_URL/auth/v1/admin/users?page=$page&per_page=100", $sb);
  $users = $res['users'] ?? [];
  foreach ($users as $u) {
    if (empty($u['email'])) continue;
    $name = $u['user_metadata']['full_name'] ?? $u['user_metadata']['name'] ?? '';
    api('https://api.brevo.com/v3/smtp/email',
      ['api-key: '.$BREVO_KEY, 'Content-Type: application/json'],
      [
        'sender' => ['name' => 'KAMPZA Store', 'email' => 'kampzastore@gmail.com'],
        'to' => [['email' => $u['email'], 'name' => $name ?: $u['email']]],
        'subject' => "🔥 Today's KAMPZA Deals",
        'htmlContent' => $html,
      ]);
    $sent++;
    usleep(150000); // gentle rate limit
  }
  $page++;
} while (count($users) === 100);

echo "Sent: $sent";