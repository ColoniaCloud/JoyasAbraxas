"use client";

import { useState, type FormEvent } from "react";

export default function ContactoPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "");
    const email = String(form.get("email") || "");
    const mensaje = String(form.get("mensaje") || "");

    const text = `Hola, soy ${nombre} (${email}).%0A%0A${mensaje}`;
    window.open(`https://wa.me/59898842100?text=${text}`, "_blank");
    setSent(true);
  }

  return (
    <main className="mx-auto max-w-[640px] px-6 py-16">
      <h1 className="mb-2 text-3xl font-light tracking-[0.18em] uppercase text-[var(--color-ink)]">
        Contacto
      </h1>
      <p className="mb-10 text-sm tracking-widest text-[var(--color-muted)] uppercase">
        Estamos aquí para ayudarte
      </p>

      {sent ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
          <p className="mb-2 text-lg font-semibold text-[var(--color-ink)]">¡Gracias por tu mensaje!</p>
          <p className="text-sm text-[var(--color-muted)]">
            Se abrió WhatsApp para que puedas enviarnos tu consulta. Si no se abrió,{" "}
            <a
              href="https://wa.me/59898842100"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-brand)] underline"
            >
              haz clic aquí
            </a>.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-4 cursor-pointer rounded-lg border border-[var(--color-line)] bg-transparent px-4 py-2 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-line)]"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium uppercase tracking-widest text-[var(--color-muted)]">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              required
              placeholder="Tu nombre"
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-brand)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium uppercase tracking-widest text-[var(--color-muted)]">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="tu@email.com"
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-brand)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium uppercase tracking-widest text-[var(--color-muted)]">
              Mensaje
            </label>
            <textarea
              name="mensaje"
              rows={5}
              required
              placeholder="¿En qué podemos ayudarte?"
              className="resize-none rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-brand)] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="mt-2 cursor-pointer rounded-lg border-0 bg-[var(--color-brand)] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--color-panel)] transition-colors hover:bg-[var(--color-brand-strong)]"
          >
            Enviar mensaje
          </button>
        </form>
      )}

      <div className="mt-12 flex flex-col gap-3 border-t border-[var(--color-line)] pt-8 text-sm text-[var(--color-muted)]">
        <p>📍 Montevideo, Uruguay</p>
        <p>📱 +598 98 842 100 (WhatsApp)</p>
      </div>
    </main>
  );
}
