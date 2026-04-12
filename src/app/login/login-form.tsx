"use client";

import { useState, type FormEvent } from "react";

export default function LoginForm() {
  const [status, setStatus] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");

    setStatus("Validando credenciales...");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const body = await response.json();

      if (!response.ok || !body?.token) {
        throw new Error(body?.message || "Credenciales inválidas");
      }

      localStorage.setItem("abraxas_token", body.token);
      localStorage.setItem(
        "abraxas_user",
        JSON.stringify({
          email: body.user_email,
          name: body.user_display_name,
        })
      );

      setStatus(`Sesión iniciada para ${body.user_display_name}`);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión"
      );
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <label className="grid gap-1.5 text-[0.95rem] font-semibold">
          Usuario o email
          <input
            type="text"
            name="username"
            required
            autoComplete="username"
            className="rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit]"
          />
        </label>

        <label className="grid gap-1.5 text-[0.95rem] font-semibold">
          Contraseña
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit]"
          />
        </label>

        <button
          type="submit"
          className="cursor-pointer rounded-[9px] border-0 bg-[var(--color-brand)] p-3 font-[inherit] font-bold text-[#f6fffb] hover:bg-[var(--color-brand-strong)]"
        >
          Entrar
        </button>
      </form>

      <p className="mt-3 min-h-5 font-semibold" aria-live="polite">
        {status}
      </p>
    </>
  );
}
