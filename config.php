<?php
// KAMPZA server config. Never put the service key in HTML/JS.
return [
  'supabase_url'     => 'https://YOUR-PROJECT.supabase.co',
  'supabase_anon'    => 'YOUR_SUPABASE_ANON_KEY',
  'supabase_service' => 'YOUR_SUPABASE_SERVICE_ROLE_KEY', // Supabase > Project Settings > API (secret)
  'site_url'         => 'https://yourdomain.com/store.html',
  'base_url'         => 'https://yourdomain.com',          // folder where these PHP files live
  'mail_driver'      => 'resend',                          // 'resend' (recommended) or 'mail'
  'resend_key'       => 're_XXXXXXXX',                     // resend.com > API Keys
  'mail_from'        => 'KAMPZA <hello@yourdomain.com>',   // must be a domain verified in Resend
  'secret'           => 'CHANGE-ME-long-random-string',    // signs unsubscribe links
  'cron_key'         => 'CHANGE-ME-another-random-string', // protects daily-digest.php if run by URL
  'tz'               => 'Africa/Lagos',
];
