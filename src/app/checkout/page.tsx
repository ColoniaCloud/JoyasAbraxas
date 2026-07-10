"use client";

import { useCart } from "@/lib/cart-context";
import { unitPrice, customizationSummary } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { trackBeginCheckout } from "@/lib/analytics";
import type { CheckoutRequest, PaymentMethod } from "@/lib/types/checkout";
import { Building2, CreditCard, LogIn, ShieldCheck, UserCheck } from "lucide-react";
import PromoBanner from "@/components/promo-banner";
import ShippingProgress from "@/components/shipping-progress";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

const MercadoPagoBrick = dynamic(() => import("@/components/mercadopago-brick"), { ssr: false });

type AccountMode = "idle" | "login" | "guest";
type CheckoutStep = "form" | "brick";

interface StoredUser {
  email: string;
  name: string;
}

// text-base (16px) en móvil evita el auto-zoom de iOS al enfocar; vuelve a 14px en ≥sm
const INPUT = "rounded-[9px] border border-[var(--color-line)] p-2.5 font-[inherit] w-full bg-[var(--color-bg)] text-base sm:text-sm";

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercadopago");
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("form");
  const [pendingPayload, setPendingPayload] = useState<CheckoutRequest | null>(null);

  const [accountMode, setAccountMode] = useState<AccountMode>("idle");
  const [loggedUser, setLoggedUser] = useState<StoredUser | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("abraxas_user");
    const token = localStorage.getItem("abraxas_token");
    if (stored && token) {
      try { setLoggedUser(JSON.parse(stored) as StoredUser); } catch { /* ignorar */ }
    }
  }, []);

  // begin_checkout: una sola vez, cuando el carrito ya está cargado
  const beginCheckoutFired = useRef(false);
  useEffect(() => {
    if (beginCheckoutFired.current || items.length === 0) return;
    beginCheckoutFired.current = true;
    trackBeginCheckout(
      items.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: unitPrice(i),
        quantity: i.quantity,
      })),
      totalPrice,
    );
  }, [items, totalPrice]);

  function handleLogout() {
    localStorage.removeItem("abraxas_token");
    localStorage.removeItem("abraxas_user");
    setLoggedUser(null);
    setAccountMode("idle");
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Credenciales invalidas");
      localStorage.setItem("abraxas_token", data.token);
      const user: StoredUser = { email: data.user_email, name: data.user_display_name };
      localStorage.setItem("abraxas_user", JSON.stringify(user));
      setLoggedUser(user);
      setAccountMode("idle");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Error al iniciar sesion");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    // Combina las notas escritas en el checkout con las notas por producto
    // (input "Notas" de la página de producto) en una sola nota del pedido.
    const baseNotes = String(form.get("notes") || "").trim();
    const productNotes = items
      .filter((i) => i.customization?.note?.trim())
      .map((i) => `${i.product.name}: ${i.customization!.note!.trim()}`);
    const notes = [baseNotes, ...productNotes].filter(Boolean).join("\n");
    const payload: CheckoutRequest = {
      customer: {
        firstName: String(form.get("firstName") || ""),
        lastName: String(form.get("lastName") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        address: String(form.get("address") || ""),
        city: String(form.get("city") || ""),
        postalCode: String(form.get("postalCode") || ""),
        notes,
        ...(shipToDifferent && {
          shippingAddress: String(form.get("shippingAddress") || ""),
          shippingCity: String(form.get("shippingCity") || ""),
          shippingPostalCode: String(form.get("shippingPostalCode") || ""),
        }),
      },
      items: items.map((item) => ({
        productId: item.product.id,
        variationId: item.customization?.variationId,
        quantity: item.quantity,
        price: unitPrice(item).toString(),
        name: item.product.name,
        personalization: item.customization?.personalization,
      })),
      paymentMethod,
    };
    if (paymentMethod === "bank_transfer") {
      void submitOrder(payload);
    } else {
      setPendingPayload(payload);
      setCheckoutStep("brick");
    }
  }

  async function submitOrder(payload: CheckoutRequest) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error procesando el pedido");
      sessionStorage.setItem("abraxas_order_id", String(data.orderId));
      // Guardamos datos del pedido para disparar `purchase` en /checkout/resultado
      // (el carrito se vacía a continuación).
      try {
        sessionStorage.setItem(
          "abraxas_purchase",
          JSON.stringify({
            orderId: data.orderId,
            value: totalPrice,
            items: items.map((i) => ({
              id: i.product.id,
              name: i.product.name,
              price: unitPrice(i),
              quantity: i.quantity,
            })),
          }),
        );
      } catch {
        /* ignorar */
      }
      clearCart();
      if (data.method === "bank_transfer") {
        router.push(`/checkout/resultado?status=bank_transfer&total=${encodeURIComponent(data.total ?? "")}`);
      } else {
        router.push(`/checkout/resultado?status=${data.resultStatus ?? "pending"}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado. Intenta de nuevo.");
      setLoading(false);
    }
  }

  async function handleBrickPayment(mpFormData: Record<string, unknown>) {
    if (!pendingPayload) return;
    await submitOrder({ ...pendingPayload, mpFormData });
  }

  const bankDiscount = paymentMethod === "bank_transfer" ? totalPrice * 0.1 : 0;
  const displayTotal = totalPrice - bankDiscount;

  const [loggedFirst, loggedLast] = loggedUser
    ? [loggedUser.name.split(" ")[0] ?? "", loggedUser.name.split(" ").slice(1).join(" ")]
    : ["", ""];

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-[680px] px-4 py-8 text-center">
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8">
          <h1 className="mt-0 mb-2">Checkout</h1>
          <p className="text-[var(--color-muted)]">Tu carrito esta vacio.</p>
          <Link href="/productos" className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 font-bold text-[#f6fffb] hover:bg-[var(--color-brand-strong)]">
            Ver productos
          </Link>
        </section>
      </main>
    );
  }

  if (checkoutStep === "brick" && pendingPayload) {
    return (
      <main className="mx-auto max-w-[960px] px-4 py-8">
        <button type="button" onClick={() => { setCheckoutStep("form"); setError(""); }} className="mb-4 inline-block font-semibold text-[var(--color-brand-strong)]">
          Volver a los datos
        </button>
        <h1 className="mb-6">Pago con tarjeta</h1>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h2 className="mt-0 mb-4 text-lg">Ingresa los datos de tu tarjeta</h2>
            {error && <p className="mb-4 rounded-lg border border-red-900/40 bg-red-950/40 p-3 text-sm text-red-400">{error}</p>}
            {loading ? (
              <div className="flex items-center justify-center py-12 text-[var(--color-muted)]">Procesando pago...</div>
            ) : (
              <MercadoPagoBrick amount={totalPrice} onSubmit={handleBrickPayment} onError={(e) => setError(String(e))} />
            )}
          </section>
          <aside className="h-fit rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h2 className="mt-0 mb-4 text-lg">Tu pedido</h2>
            <div className="flex flex-col gap-3 border-b border-[var(--color-line)] pb-4">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3">
                  <Image src={item.product.images[0]?.src ?? "/favicon.svg"} alt={item.product.name} width={56} height={56} className="size-14 rounded-lg bg-[#1c1a18] object-cover" />
                  <div className="flex-1">
                    <p className="m-0 text-sm font-semibold">{item.product.name}</p>
                    {customizationSummary(item.customization).length > 0 && (
                      <p className="m-0 text-xs text-[var(--color-muted)]">{customizationSummary(item.customization).map((d) => `${d.label}: ${d.value}`).join(" · ")}</p>
                    )}
                    <p className="m-0 text-sm text-[var(--color-muted)]">x{item.quantity} - {formatPrice(unitPrice(item) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-3 text-sm text-[var(--color-muted)]"><span>Productos ({totalItems})</span><span>{formatPrice(totalPrice)}</span></div>
            <div className="mt-2 flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(totalPrice)}</span></div>
            <ShippingProgress total={totalPrice} />
            <p className="mt-4 text-center text-xs text-[var(--color-muted)]">Pago seguro procesado por MercadoPago</p>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[960px] px-4 py-8">
      <Link href="/carrito" className="mb-4 inline-block font-semibold text-[var(--color-brand-strong)]">Volver al carrito</Link>
      <h1 className="mb-6">Checkout</h1>
      <PromoBanner />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          {!loggedUser && (
            <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <h2 className="mt-0 mb-1 text-lg">Tenes una cuenta?</h2>
              <p className="mb-4 text-sm text-[var(--color-muted)]">Inicia sesion para autocompletar tus datos, o continua como invitado.</p>
              {accountMode === "idle" && (
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setAccountMode("login")} className="inline-flex items-center gap-2 rounded-[9px] border border-[var(--color-line)] px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]">
                    <LogIn size={15} /> Si, iniciar sesion
                  </button>
                  <button type="button" onClick={() => setAccountMode("guest")} className="inline-flex items-center gap-2 rounded-[9px] border border-[var(--color-line)] px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]">
                    Continuar sin cuenta
                  </button>
                </div>
              )}
              {accountMode === "login" && (
                <form onSubmit={handleLogin} className="flex flex-col gap-3">
                  <label className="grid gap-1.5 text-sm font-semibold">Email o usuario<input type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required autoComplete="username" className={INPUT} /></label>
                  <label className="grid gap-1.5 text-sm font-semibold">Contrasena<input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required autoComplete="current-password" className={INPUT} /></label>
                  {loginError && <p className="rounded-lg border border-red-900/40 bg-red-950/40 p-2.5 text-sm text-red-400">{loginError}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={loginLoading} className="cursor-pointer rounded-[9px] border-0 bg-[var(--color-brand)] px-5 py-2.5 font-[inherit] text-sm font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)] disabled:opacity-60">{loginLoading ? "Ingresando..." : "Entrar"}</button>
                    <button type="button" onClick={() => setAccountMode("idle")} className="rounded-[9px] border border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--color-line)]">Cancelar</button>
                  </div>
                </form>
              )}
              {accountMode === "guest" && (
                <div className="flex items-start gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4">
                  <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[var(--color-brand)]" />
                  <div className="text-sm text-[var(--color-muted)]">
                    <p className="m-0 font-semibold text-[var(--color-ink)]">Tu privacidad esta protegida</p>
                    <p className="mt-1 m-0">Se creara una cuenta con tus datos para gestionar tu pedido. Tu informacion es tratada conforme a la <strong>Ley N 18.331</strong> de Proteccion de Datos Personales de Uruguay y no sera cedida a terceros.</p>
                  </div>
                </div>
              )}
            </section>
          )}
          {loggedUser && (
            <section className="flex items-center justify-between rounded-2xl border border-[var(--color-brand)]/40 bg-[var(--color-brand)]/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <UserCheck size={20} className="shrink-0 text-[var(--color-brand)]" />
                <div>
                  <p className="m-0 text-sm font-semibold">{loggedUser.name}</p>
                  <p className="m-0 text-xs text-[var(--color-muted)]">{loggedUser.email}</p>
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="text-xs text-[var(--color-muted)] underline-offset-2 hover:underline">Cerrar sesion</button>
            </section>
          )}
          {(loggedUser || accountMode === "guest" || accountMode === "login") && (
            <form onSubmit={handleFormSubmit} id="checkout-form" className="flex flex-col gap-4">
              <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
                <h2 className="mt-0 mb-4 text-lg">Datos de contacto</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-semibold">Nombre<input type="text" name="firstName" required defaultValue={loggedFirst} className={INPUT} /></label>
                  <label className="grid gap-1.5 text-sm font-semibold">Apellido<input type="text" name="lastName" required defaultValue={loggedLast} className={INPUT} /></label>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-semibold">Email<input type="email" name="email" required defaultValue={loggedUser?.email ?? ""} className={INPUT} /></label>
                  <label className="grid gap-1.5 text-sm font-semibold">Telefono<input type="tel" name="phone" className={INPUT} /></label>
                </div>
                <div className="mt-4 border-t border-[var(--color-line)] pt-4">
                  <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Direccion</p>
                  <label className="grid gap-1.5 text-sm font-semibold">Calle y numero<input type="text" name="address" required className={INPUT} /></label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-semibold">Ciudad<input type="text" name="city" required className={INPUT} /></label>
                    <label className="grid gap-1.5 text-sm font-semibold">Codigo postal<input type="text" name="postalCode" className={INPUT} /></label>
                  </div>
                </div>
                <label className="mt-4 flex cursor-pointer items-center gap-3 select-none">
                  <div role="switch" aria-checked={shipToDifferent} onClick={() => setShipToDifferent((v) => !v)} className={`relative h-6 w-11 rounded-full transition-colors ${shipToDifferent ? "bg-[var(--color-brand)]" : "bg-[var(--color-line)]"}`}>
                    <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${shipToDifferent ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <span className="text-sm font-semibold">Enviar a una direccion diferente</span>
                </label>
                {shipToDifferent && (
                  <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4">
                    <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Direccion de envio</p>
                    <label className="grid gap-1.5 text-sm font-semibold">Calle y numero<input type="text" name="shippingAddress" required={shipToDifferent} className={INPUT} /></label>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-sm font-semibold">Ciudad<input type="text" name="shippingCity" required={shipToDifferent} className={INPUT} /></label>
                      <label className="grid gap-1.5 text-sm font-semibold">Codigo postal<input type="text" name="shippingPostalCode" className={INPUT} /></label>
                    </div>
                  </div>
                )}
                <label className="mt-4 grid gap-1.5 text-sm font-semibold">Notas del pedido<textarea name="notes" rows={3} className={`${INPUT} resize-none`} /></label>
              </section>
              <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
                <h2 className="mt-0 mb-4 text-lg">Metodo de pago</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setPaymentMethod("mercadopago")} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${paymentMethod === "mercadopago" ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5" : "border-[var(--color-line)] hover:border-[var(--color-brand)]/50"}`}>
                    <CreditCard size={22} className="shrink-0 text-[var(--color-brand)]" />
                    <div><p className="m-0 font-semibold text-sm">Tarjetas de Debito y Credito</p><p className="m-0 text-xs text-[var(--color-muted)]">Visa, Mastercard, Abitab, Red Pagos</p></div>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod("bank_transfer")} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${paymentMethod === "bank_transfer" ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5" : "border-[var(--color-line)] hover:border-[var(--color-brand)]/50"}`}>
                    <Building2 size={22} className="shrink-0 text-[var(--color-brand)]" />
                    <div><p className="m-0 font-semibold text-sm">Transferencia Bancaria</p><p className="m-0 text-xs text-[var(--color-brand)]">BROU - Caja de ahorro en pesos · 10% de descuento</p></div>
                  </button>
                </div>
              </section>
            </form>
          )}
        </div>
        <aside className="h-fit rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <h2 className="mt-0 mb-4 text-lg">Tu pedido</h2>
          <div className="flex flex-col gap-3 border-b border-[var(--color-line)] pb-4">
            {items.map((item) => (
              <div key={item.key} className="flex gap-3">
                <Image src={item.product.images[0]?.src ?? "/favicon.svg"} alt={item.product.name} width={56} height={56} className="size-14 rounded-lg bg-[#1c1a18] object-cover" />
                <div className="flex-1">
                  <p className="m-0 text-sm font-semibold">{item.product.name}</p>
                  {customizationSummary(item.customization).length > 0 && (
                    <p className="m-0 text-xs text-[var(--color-muted)]">{customizationSummary(item.customization).map((d) => `${d.label}: ${d.value}`).join(" · ")}</p>
                  )}
                  <p className="m-0 text-sm text-[var(--color-muted)]">x{item.quantity} - {formatPrice(unitPrice(item) * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-3 text-sm text-[var(--color-muted)]"><span>Productos ({totalItems})</span><span>{formatPrice(totalPrice)}</span></div>
          {bankDiscount > 0 && (
            <div className="flex justify-between text-sm text-[var(--color-brand)]"><span>Descuento transferencia (10%)</span><span>-{formatPrice(bankDiscount)}</span></div>
          )}
          <div className="mt-2 flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(displayTotal)}</span></div>
          <ShippingProgress total={displayTotal} />
          <button type="submit" form="checkout-form" disabled={loading || (!loggedUser && accountMode === "idle") || accountMode === "login"} className="mt-4 w-full cursor-pointer rounded-[9px] border-0 bg-[var(--color-brand)] p-3 font-[inherit] font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "Procesando..." : paymentMethod === "mercadopago" ? "Continuar al pago" : "Confirmar pedido"}
          </button>
          {(!loggedUser && accountMode === "idle") && <p className="mt-2 text-center text-xs text-[var(--color-muted)]">Elegi una opcion arriba para continuar</p>}
          {error && <p className="mt-3 rounded-lg border border-red-900/40 bg-red-950/40 p-3 text-sm text-red-400">{error}</p>}
        </aside>
      </div>
    </main>
  );
}
