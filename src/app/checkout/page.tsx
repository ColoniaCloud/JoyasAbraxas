"use client";

import { useCart } from "@/lib/cart-context";
import type { CheckoutRequest } from "@/lib/types/checkout";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const payload: CheckoutRequest = {
      customer: {
        firstName: String(form.get("firstName") || ""),
        lastName: String(form.get("lastName") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        address: String(form.get("address") || ""),
        city: String(form.get("city") || ""),
        postalCode: String(form.get("postalCode") || ""),
        notes: String(form.get("notes") || ""),
      },
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name,
      })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error procesando el pedido");
      }

      // Guardar orderId para la página de resultado
      sessionStorage.setItem("abraxas_order_id", String(data.orderId));

      // Limpiar carrito antes de redirigir
      clearCart();

      // Redirigir a MercadoPago
      window.location.href = data.initPoint;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error inesperado. Intenta de nuevo."
      );
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-[680px] px-4 py-8 text-center">
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8">
          <h1 className="mt-0 mb-2">Checkout</h1>
          <p className="text-[var(--color-muted)]">Tu carrito está vacío.</p>
          <Link
            href="/productos"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 font-bold text-[#f6fffb] hover:bg-[var(--color-brand-strong)]"
          >
            Ver productos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[960px] px-4 py-8">
      <Link href="/carrito" className="mb-4 inline-block font-semibold text-[var(--color-brand-strong)]">
        Volver al carrito
      </Link>
      <h1 className="mb-6">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <form onSubmit={handleSubmit} id="checkout-form" className="flex flex-col gap-4">
          <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h2 className="mt-0 mb-4 text-lg">Datos de contacto</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold">
                Nombre
                <input
                  type="text"
                  name="firstName"
                  required
                  className="rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                Apellido
                <input
                  type="text"
                  name="lastName"
                  required
                  className="rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit]"
                />
              </label>
            </div>
            <label className="mt-3 grid gap-1.5 text-sm font-semibold">
              Email
              <input
                type="email"
                name="email"
                required
                className="rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit]"
              />
            </label>
            <label className="mt-3 grid gap-1.5 text-sm font-semibold">
              Teléfono
              <input
                type="tel"
                name="phone"
                className="rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit]"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h2 className="mt-0 mb-4 text-lg">Dirección de envío</h2>
            <label className="grid gap-1.5 text-sm font-semibold">
              Dirección
              <input
                type="text"
                name="address"
                required
                className="rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit]"
              />
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold">
                Ciudad
                <input
                  type="text"
                  name="city"
                  required
                  className="rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                Código postal
                <input
                  type="text"
                  name="postalCode"
                  className="rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit]"
                />
              </label>
            </div>
            <label className="mt-3 grid gap-1.5 text-sm font-semibold">
              Notas del pedido
              <textarea
                name="notes"
                rows={3}
                className="rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit] resize-none"
              />
            </label>
          </section>
        </form>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <h2 className="mt-0 mb-4 text-lg">Tu pedido</h2>
          <div className="flex flex-col gap-3 border-b border-[var(--color-line)] pb-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-3">
                <Image
                  src={item.product.images[0]?.src ?? "/favicon.svg"}
                  alt={item.product.name}
                  width={56}
                  height={56}
                  className="size-14 rounded-lg bg-[#1c1a18] object-cover"
                />
                <div className="flex-1">
                  <p className="m-0 text-sm font-semibold">{item.product.name}</p>
                  <p className="m-0 text-sm text-[var(--color-muted)]">
                    x{item.quantity} — ${(parseFloat(item.product.price || "0") * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-3 text-sm text-[var(--color-muted)]">
            <span>Productos ({totalItems})</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="mt-4 w-full cursor-pointer rounded-[9px] border-0 bg-[var(--color-brand)] p-3 font-[inherit] font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Procesando..." : "Pagar con MercadoPago"}
          </button>

          {error && (
            <p className="mt-3 rounded-lg border border-red-900/40 bg-red-950/40 p-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
