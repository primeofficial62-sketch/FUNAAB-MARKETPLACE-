// Supabase Edge Function: send-email  (turn "Verify JWT" OFF for this function)
Deno.serve(async (req) => {
  if (req.headers.get("x-email-secret") !== Deno.env.get("EMAIL_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }
  const { to, subject, html } = await req.json();
  if (!to || !subject || !html) return new Response("bad request", { status: 400 });

  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": Deno.env.get("BREVO_API_KEY")!,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "FUNAAB Marketplace", email: Deno.env.get("SENDER_EMAIL") },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  return new Response(await r.text(), { status: r.status });
});
