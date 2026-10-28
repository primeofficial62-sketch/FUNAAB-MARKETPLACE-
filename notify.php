// Supabase Edge Function "notify" — sends KAMPZA emails through Brevo SMTP.
// Deploy with "Verify JWT" OFF. Secrets are set in the dashboard, never in this file.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const env = (k: string, d = "") => Deno.env.get(k) ?? d;
const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
const FROM = env("FROM_EMAIL"), FROM_NAME = env("FROM_NAME", "KAMPZA");
const SITE = env("SITE_URL").replace(/\/$/, "");
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, authorization, apikey", "Content-Type": "application/json" };
const reply = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: cors });
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const naira = (n: number) => "₦" + Number(n).toLocaleString("en-NG");

// Port 465 (SSL): Supabase blocks outbound 25/587.
const mk = () => new SMTPClient({ connection: { hostname: env("BREVO_HOST", "smtp-relay.brevo.com"), port: 465, tls: true, auth: { username: env("BREVO_SMTP_USER"), password: env("BREVO_SMTP_KEY") } } });
const send = (c: SMTPClient, to: string, subject: string, html: string) => c.send({ from: `${FROM_NAME} <${FROM}>`, to, subject, html });

const wrap = (title: string, body: string) => `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#252525"><div style="font-size:26px;font-weight:700;color:#FF7628">KAMPZA</div><h2 style="margin:18px 0 8px">${title}</h2>${body}<p style="margin:24px 0 0"><a href="${SITE}" style="display:inline-block;background:#FF7628;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">Open KAMPZA</a></p><p style="margin-top:28px;color:#888;font-size:12px">Find It. Get It. Love It.<br>Turn these emails off in Account → Notifications.</p></div>`;

async function deals() {
  try {
    const j = await (await fetch(`${SITE}/deals.json`, { cache: "no-store" })).json();
    const P: any[] = j.products || [];
    const f = (j.flash || []).map((id: string) => P.find((x) => x.id === id)).filter(Boolean);
    return (f.length ? f : P).slice(0, 6);
  } catch { return []; }
}

async function digest() {
  const list = await deals();
  if (!list.length) return { ok: true, sent: 0, note: "no deals found at SITE_URL/deals.json" };
  const rows = list.map((p) => `<tr><td style="padding:10px 0;border-bottom:1px solid #eee">${esc(p.e || "🛍️")} <b>${esc(p.n)}</b></td><td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap"><b>${naira(p.p)}</b>${p.o > p.p ? ` <s style="color:#999">${naira(p.o)}</s>` : ""}</td></tr>`).join("");
  const c = mk(); let sent = 0;
  try {
    for (let page = 1; ; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error || !data.users.length) break;
      for (const u of data.users) {
        const m: any = u.user_metadata || {};
        if (!u.email || !u.email_confirmed_at || m.email_daily === false) continue;
        const name = esc((m.full_name || m.name || u.email.split("@")[0]).split(" ")[0]);
        try { await send(c, u.email, "Today’s KAMPZA deals are live", wrap(`Good morning, ${name} 👋`, `<p>Here are today’s Flash Deals:</p><table style="width:100%;border-collapse:collapse">${rows}</table>`)); sent++; } catch (_) { /* skip failed recipient */ }
      }
      if (data.users.length < 200) break;
    }
  } finally { await c.close(); }
  return { ok: true, sent };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const b = await req.json();
    if (b.type === "daily_digest") {
      if (!env("CRON_SECRET") || req.headers.get("x-cron-secret") !== env("CRON_SECRET")) return reply({ ok: false, error: "forbidden" }, 403);
      return reply(await digest());
    }
    if (b.type === "welcome") {
      const { data, error } = await admin.auth.getUser(b.token || "");
      const u = data?.user;
      if (error || !u?.email || !u.email_confirmed_at) return reply({ ok: false, error: "not verified" }, 401);
      const m: any = u.user_metadata || {};
      if (m.email_updates === false) return reply({ ok: true, skipped: true });
      const first = !m.welcomed, now = Date.now();
      if (!first && now - (m.last_welcome_at || 0) < 12 * 3600e3) return reply({ ok: true, skipped: true });
      const name = esc((m.full_name || m.name || u.email.split("@")[0]).split(" ")[0]);
      const c = mk();
      try {
        await send(c, u.email, first ? "Welcome to KAMPZA 🧡" : `Welcome back, ${name}`,
          first ? wrap(`Welcome, ${name}!`, "<p>Your account is ready. Browse campus deals, save favourites and order in a few taps.</p>")
                : wrap(`Welcome back, ${name} 👋`, "<p>Good to see you again. New campus deals are waiting.</p>"));
      } finally { await c.close(); }
      await admin.auth.admin.updateUserById(u.id, { user_metadata: { ...m, welcomed: true, last_welcome_at: now } });
      return reply({ ok: true });
    }
    return reply({ ok: false, error: "unknown type" }, 400);
  } catch (e) { return reply({ ok: false, error: String((e as Error)?.message || e) }, 500); }
});
