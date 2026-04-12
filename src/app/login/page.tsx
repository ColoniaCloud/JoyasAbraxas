import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | Abraxas Joyería",
  description: "Accede a tu cuenta en Abraxas Joyería.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-[680px] px-4 py-8">
      <a
        href="/"
        className="mb-4 inline-block font-semibold text-[var(--color-brand-strong)]"
      >
        Volver
      </a>
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <h1 className="mt-0">Iniciar sesión</h1>
        <p className="text-[var(--color-muted)]">
          Ingresa tus credenciales para acceder a tu cuenta.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
