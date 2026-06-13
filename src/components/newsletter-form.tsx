"use client";

import { useState, type FormEvent } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo suscribir");
      setStatus("ok");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "No se pudo suscribir");
    }
  }

  if (status === "ok") {
    return (
      <p className="text-sm text-[var(--color-brand)]">
        ¡Gracias! Te sumamos a nuestra lista. 💌
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          aria-label="Email para newsletter"
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-background)] px-3 py-2 text-base text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand)] sm:text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 cursor-pointer rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)] disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Suscribirme"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-400">{msg}</p>
      )}
    </form>
  );
}
