const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  // Vercel cron sends this header automatically when CRON_SECRET is set
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, BREVO_API_KEY, SITE_URL } = process.env;
  const sb = { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` };

  // 1. Deals (adjust table/columns to match yours)
  const dr = await fetch(`${SUPABASE_URL}/rest/v1/products?is_deal=eq.true&select=name,price,old_price,image_url&limit=6`, { headers: sb });
  const deals = await dr.json();
  if (!Array.isArray(deals) || !deals.length) return res.status(200).json({ sent: 0, note: 'No deals' });

  // 2. Email HTML
  let rows = '';
  deals.forEach((d, i) => {
    if (i % 2 === 0) rows += '<tr>';
    rows += `<td style="width:50%;padding:8px;vertical-align:top">
      <img src="${esc(d.image_url)}" style="width:100%;border-radius:8px">
      <div style="font-size:14px;margin-top:6px">${esc(d.name)}</div>
      <div style="font-weight:bold">${d.old_price ? `<s style="color:#999;font-size:12px">₦${Number(d.old_price).toLocaleString()}</s> ` : ''}₦${Number(d.price).toLocaleString()}</div>
    </td>`;
    if (i % 2 === 1 || i === deals.length - 1) rows += '</tr>';
  });

  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
    <div style="background:#111;padding:20px;text-align:center;color:#fff;font-size:22px;font-weight:bold">KAMPZA</div>
    <div style="padding:20px"><h2 style="margin-top:0">🔥 Today's Deals</h2>
    <table width="100%">${rows}</table>
    <p style="text-align:center"><a href="${SITE_URL}" style="background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Shop Now</a></p></div>
    <div style="background:#f7f7f7;padding:14px;text-align:center;font-size:12px;color:#888">
    Find It. Get It. Love It.<br>kampzastore@gmail.com · WhatsApp 09059538257</div></div>`;

  // 3. Users, then send in batches of 100 (one Brevo call per batch)
  let sent = 0, page = 1, users;
  do {
    const ur = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=100`, { headers: sb });
    users = (await ur.json()).users || [];
    const list = users.filter((u) => u.email);

    if (list.length) {
      const r = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'KAMPZA Store', email: 'kampzastore@gmail.com' },
          subject: "🔥 Today's KAMPZA Deals",
          htmlContent: html,
          messageVersions: list.map((u) => ({
            to: [{ email: u.email, name: u.user_metadata?.full_name || u.user_metadata?.name || u.email }],
          })),
        }),
      });
      if (r.ok) sent += list.length;
    }
    page++;
  } while (users.length === 100);

  return res.status(200).json({ sent });
};