# KAMPZA backend setup (about 20 minutes)

Do these in order.

## 1. Database
Supabase → SQL Editor → paste and run `kampza-schema.sql`.
Sign up in your app, then run the commented "make yourself admin" line with your email.

## 2. Edge Functions
Create one function per file (folder name → file renamed to `index.ts`):
| Function | File | Deploy |
|---|---|---|
| `notify` | notify.ts | `supabase functions deploy notify` |
| `kampza-ai` | kampza-ai.ts | `supabase functions deploy kampza-ai` |
| `paystack-verify` | paystack-verify.ts | `supabase functions deploy paystack-verify` |
| `paystack-webhook` | paystack-webhook.ts | `supabase functions deploy paystack-webhook --no-verify-jwt` |

Secrets:
```
supabase secrets set RESEND_API_KEY=... MAIL_FROM="KAMPZA <hello@yourdomain.com>" CRON_SECRET=pick-a-long-random-string SITE_URL=https://yoursite.com
supabase secrets set ANTHROPIC_API_KEY=... WHATSAPP=2349059538257 SUPPORT_EMAIL=kampzastore@gmail.com
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_...
```
Resend only sends to arbitrary users once your sending domain is verified.
Paystack dashboard → Webhook URL: `https://fcgvmxkxwgymgqcbtzjd.supabase.co/functions/v1/paystack-webhook`

## 3. Front end
1. In `store.html`, set `PAYSTACK_KEY` to your **public** key (`pk_...`).
2. Add this line right before `</body>`: `<script src="kampza-cloud.js"></script>`
3. Upload `kampza-cloud.js`, `deals.json` (fallback catalog) and `admin.html` next to `store.html`.

## 4. Daily deals email
Edit and run the commented `cron.schedule` block at the bottom of the SQL (enable `pg_cron` and `pg_net` first).

## 5. Test checklist
- New signup → welcome email; log out/in → "welcome back".
- Place a Pay on delivery order → appears in My Orders; stock drops in admin.
- Fund ₦100 with a Paystack test key → wallet updates; pay an order from wallet.
- In admin set an order to Cancelled → wallet order is refunded.
- Edit `localStorage` balance in DevTools → reload → balance resets (server wins).
- Delete a throwaway account.
