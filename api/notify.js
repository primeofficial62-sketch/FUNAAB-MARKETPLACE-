const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

const wrap = (body) => `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
  <div style="background:#111;padding:20px;text-align:center;color:#fff;font-size:22px;font-weight:bold">KAMPZA</div>
  <div style="padding:24px;color:#333;line-height:1.6">${body}</div>
  <div style="background:#f7f7f7;padding:14px;text-align:center;font-size:12px;color:#888">
    Find It. Get It. Love It.<br>kampzastore@gmail.com · WhatsApp 09059538257
  </div>
</div>`;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { type, email, name } = req.body || {};
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  if (type !== 'welcome') return res.status(400).json({ error: 'Unknown type' });

  const n = esc(name || 'there');
  const r = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'KAMPZA Store', email: 'kampzastore@gmail.com' },
      to: [{ email, name: n }],
      subject: `Welcome to KAMPZA, ${n}!`,
      htmlContent: wrap(`<h2>Welcome, ${n} 🎉</h2>
        <p>Your account is ready. Browse categories, grab daily deals and shop with ease.</p>
        <p>Need help? Reply to this email or chat us on WhatsApp.</p>`),
    }),
  });

  return res.status(r.ok ? 200 : 500).json(await r.json().catch(() => ({})));
};