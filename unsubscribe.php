<?php
require __DIR__ . '/lib.php';
$id = (string)($_GET['u'] ?? $_POST['u'] ?? '');
$t  = (string)($_GET['t'] ?? $_POST['t'] ?? '');
$ok = $id !== '' && hash_equals(unsub_token($id), $t) && update_user_meta($id, ['email_daily' => false]);
http_response_code($ok || $_SERVER['REQUEST_METHOD'] === 'POST' ? 200 : 400);
?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KAMPZA</title></head>
<body style="margin:0;font-family:Arial,sans-serif;background:#F4F4F4;display:grid;place-items:center;min-height:100vh;color:#252525">
<div style="background:#fff;border-radius:14px;padding:28px;max-width:360px;margin:16px;text-align:center">
<h2 style="margin:0 0 8px">KAMP<span style="color:#FF7628">ZA</span></h2>
<?php if ($ok): ?>
<p>You’re unsubscribed from daily deal emails. You can turn them back on any time in Account.</p>
<?php else: ?>
<p>This unsubscribe link is invalid or expired. Open the app, go to Account and switch off Daily deals email.</p>
<?php endif; ?>
</div></body></html>
