import { NextResponse } from "next/server";

// Endpoint de tu proveedor de email marketing (Brevo / Mailchimp / Zapier…).
// Recibe { email, source }. Si no está configurado, la suscripción no se
// almacena (se registra un warning en el servidor).
const WEBHOOK = process.env.NEWSLETTER_WEBHOOK_URL;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Ingresá un email válido" }, { status: 400 });
  }

  if (WEBHOOK) {
    try {
      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "abraxas-web" }),
      });
      if (!res.ok) throw new Error(`webhook respondió ${res.status}`);
    } catch (e) {
      console.error("[newsletter] fallo al reenviar al webhook:", e);
      return NextResponse.json(
        { error: "No se pudo completar la suscripción. Probá más tarde." },
        { status: 502 },
      );
    }
  } else {
    console.warn(
      "[newsletter] NEWSLETTER_WEBHOOK_URL no configurado; email NO almacenado:",
      email,
    );
  }

  return NextResponse.json({ ok: true });
}
