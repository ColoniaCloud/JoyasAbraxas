"use client";

import { useCart } from "@/lib/cart-context";
import { unitPrice, customizationSummary } from "@/lib/cart";
import Image from "next/image";
import Link from "next/link";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  return (
    <main className="mx-auto max-w-[900px] px-4 py-8">
      <Link href="/productos" className="mb-4 inline-block font-semibold text-[var(--color-brand-strong)]">
        Seguir comprando
      </Link>
      <h1 className="mb-6">Carrito ({totalItems})</h1>

      {items.length === 0 ? (
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
          <p className="text-lg text-[var(--color-muted)]">Tu carrito está vacío.</p>
          <Link
            href="/productos"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 font-bold text-[#f6fffb] hover:bg-[var(--color-brand-strong)]"
          >
            Ver productos
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Items */}
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const details = customizationSummary(item.customization);
              return (
              <article
                key={item.key}
                className="flex gap-4 rounded-[14px] border border-[var(--color-line)] bg-[var(--color-panel)] p-4"
              >
                <Image
                  src={item.product.images[0]?.src ?? "/favicon.svg"}
                  alt={item.product.images[0]?.alt || item.product.name}
                  width={100}
                  height={100}
                  className="size-24 rounded-lg bg-[#1c1a18] object-cover"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/productos/${item.product.slug}`}
                      className="font-semibold hover:text-[var(--color-brand-strong)]"
                    >
                      {item.product.name}
                    </Link>
                    {details.length > 0 && (
                      <ul className="m-0 mt-1 list-none p-0 text-xs text-[var(--color-muted)]">
                        {details.map((d) => (
                          <li key={d.label}>
                            <span className="font-medium">{d.label}:</span> {d.value}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="m-0 mt-1 font-bold">
                      ${unitPrice(item).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 rounded-lg border border-[var(--color-line)]">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="cursor-pointer border-0 bg-transparent px-2.5 py-1 text-lg disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="cursor-pointer border-0 bg-transparent px-2.5 py-1 text-lg"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="cursor-pointer border-0 bg-transparent text-sm font-semibold text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
              );
            })}
            <button
              onClick={clearCart}
              className="cursor-pointer self-start rounded-[9px] border border-[var(--color-line)] bg-transparent px-3 py-1.5 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-line)]"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h2 className="mt-0 mb-4 text-lg">Resumen</h2>
            <div className="flex justify-between border-b border-[var(--color-line)] pb-3 text-sm">
              <span className="text-[var(--color-muted)]">Productos ({totalItems})</span>
              <span className="font-semibold">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 text-lg font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-4 block w-full rounded-[9px] bg-[var(--color-brand)] p-3 text-center font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)]"
            >
              Ir al checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
