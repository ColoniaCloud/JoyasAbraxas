"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserInfo {
  email: string;
  name: string;
}

export default function MiCuentaPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("abraxas_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  function handleLogout() {
    localStorage.removeItem("abraxas_token");
    localStorage.removeItem("abraxas_user");
    setUser(null);
  }

  if (!loaded) return null;

  if (!user) {
    return (
      <main className="mx-auto max-w-[680px] px-4 py-8">
        <Link href="/" className="mb-4 inline-block font-semibold text-[var(--color-brand-strong)]">
          Volver
        </Link>
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 text-center">
          <h1 className="mt-0 mb-2">Mi cuenta</h1>
          <p className="text-[var(--color-muted)]">
            No has iniciado sesión.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 font-bold text-[#f6fffb] hover:bg-[var(--color-brand-strong)]"
          >
            Iniciar sesión
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[680px] px-4 py-8">
      <Link href="/" className="mb-4 inline-block font-semibold text-[var(--color-brand-strong)]">
        Volver
      </Link>
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <h1 className="mt-0 mb-4">Mi cuenta</h1>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-brand)] text-xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="m-0 text-lg font-semibold">{user.name}</p>
            <p className="m-0 text-sm text-[var(--color-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/carrito"
            className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-background)] p-4 transition-colors hover:bg-[var(--color-line)]"
          >
            <h3 className="m-0 mb-1">Carrito</h3>
            <p className="m-0 text-sm text-[var(--color-muted)]">Ver productos en tu carrito</p>
          </Link>
          <Link
            href="/productos"
            className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-background)] p-4 transition-colors hover:bg-[var(--color-line)]"
          >
            <h3 className="m-0 mb-1">Catálogo</h3>
            <p className="m-0 text-sm text-[var(--color-muted)]">Explorar productos</p>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 cursor-pointer rounded-[9px] border border-red-900/40 bg-red-950/40 px-4 py-2 font-semibold text-red-700 transition-colors hover:bg-red-900/30"
        >
          Cerrar sesión
        </button>
      </section>
    </main>
  );
}
