"use client";

import { Building2, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { trackPurchase } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import { Suspense } from "react";

function ResultadoContent() {
	const searchParams = useSearchParams();
	const status = searchParams.get("status");
	const total = searchParams.get("total");
	const { clearCart } = useCart();

	// Limpiar carrito en success/pending (por si el redirect no lo hizo)
	// y disparar el evento `purchase` (una sola vez) con los datos del pedido.
	useEffect(() => {
		if (status === "success" || status === "pending" || status === "bank_transfer") {
			clearCart();
			try {
				const raw = sessionStorage.getItem("abraxas_purchase");
				if (raw) {
					const p = JSON.parse(raw);
					trackPurchase({ orderId: p.orderId, value: p.value, items: p.items });
					sessionStorage.removeItem("abraxas_purchase");
				}
			} catch {
				/* ignorar */
			}
		}
	}, [status, clearCart]);

	if (status === "success") {
		return (
			<section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
				<div className="mb-4 flex justify-center">
				<CheckCircle size={48} className="text-green-500" />
			</div>
				<h1 className="mt-0 mb-2 text-2xl">¡Gracias por tu compra!</h1>
				<p className="text-[var(--color-muted)]">
					Tu pedido fue procesado correctamente. Te enviaremos un
					email con los detalles y el seguimiento de tu envío.
				</p>
				<Link
					href="/productos"
					className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-6 py-2.5 font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)]"
				>
					Seguir comprando
				</Link>
			</section>
		);
	}

	if (status === "pending") {
		return (
			<section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
				<div className="mb-4 flex justify-center">
				<Clock size={48} className="text-yellow-500" />
			</div>
				<h1 className="mt-0 mb-2 text-2xl">Pago en proceso</h1>
				<p className="text-[var(--color-muted)]">
					Tu pago está siendo procesado. Te notificaremos por email
					cuando se confirme. Si pagaste por Abitab o Red Pagos,
					puede tardar hasta 48 horas.
				</p>
				<Link
					href="/productos"
					className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-6 py-2.5 font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)]"
				>
					Volver a la tienda
				</Link>
			</section>
		);
	}

	if (status === "bank_transfer") {
		return (
			<section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8">
				<div className="mb-4 flex justify-center">
					<Building2 size={48} className="text-[var(--color-brand)]" />
				</div>
				<h1 className="mt-0 mb-2 text-center text-2xl">Pedido confirmado</h1>
				<p className="mb-6 text-center text-[var(--color-muted)]">
					Transferí el importe a la siguiente cuenta y tu pedido será confirmado en menos de 24 horas hábiles.
				</p>
				<div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-5 text-sm">
					<dl className="grid gap-3">
						{total && (
							<div className="flex justify-between gap-4">
								<dt className="font-semibold text-[var(--color-ink)]">Monto a transferir</dt>
								<dd className="font-bold text-[var(--color-brand)]">{formatPrice(total)} <span className="font-normal text-xs text-[var(--color-muted)]">(10% off aplicado)</span></dd>
							</div>
						)}
						<div className="flex justify-between gap-4">
							<dt className="font-semibold text-[var(--color-ink)]">Banco</dt>
							<dd className="text-[var(--color-muted)]">BROU</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="font-semibold text-[var(--color-ink)]">Tipo de cuenta</dt>
							<dd className="text-[var(--color-muted)]">Caja de ahorro en pesos</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="font-semibold text-[var(--color-ink)]">Número de cuenta</dt>
							<dd className="font-mono text-[var(--color-muted)]">001697550-00001</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="font-semibold text-[var(--color-ink)]">Titular</dt>
							<dd className="text-[var(--color-muted)]">Lucas Costabel</dd>
						</div>
					</dl>
				</div>
				<p className="mt-4 text-center text-xs text-[var(--color-muted)]">
					Una vez realizada la transferencia, envianos el comprobante por{" "}
					<a
						href="https://wa.me/59898842100"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[var(--color-brand)] hover:underline"
					>
						WhatsApp
					</a>{" "}
					o por{" "}
					<a
						href="/contacto"
						className="text-[var(--color-brand)] hover:underline"
					>
						nuestro formulario de contacto
					</a>
					.
				</p>
				<Link
					href="/productos"
					className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-brand)] px-6 py-2.5 font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)]"
				>
					Volver a la tienda
				</Link>
			</section>
		);
	}

	// failure o status desconocido
	return (
		<section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
			<div className="mb-4 flex justify-center">
				<XCircle size={48} className="text-red-500" />
			</div>
			<h1 className="mt-0 mb-2 text-2xl">Pago no procesado</h1>
			<p className="text-[var(--color-muted)]">
				No pudimos procesar tu pago. No se realizó ningún cobro.
				Puedes intentar de nuevo o elegir otro medio de pago.
			</p>
			<div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
				<Link
					href="/carrito"
					className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-6 py-2.5 font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)]"
				>
					Volver al carrito
				</Link>
				<Link
					href="/contacto"
					className="inline-flex items-center justify-center rounded-full border border-[var(--color-line)] px-6 py-2.5 font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-line)]"
				>
					Contactar soporte
				</Link>
			</div>
		</section>
	);
}

export default function ResultadoPage() {
	return (
		<main className="mx-auto max-w-[680px] px-4 py-12">
			<Suspense
				fallback={
					<div className="flex items-center justify-center py-16">
						<div className="size-10 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-brand)]" />
					</div>
				}
			>
				<ResultadoContent />
			</Suspense>
		</main>
	);
}
