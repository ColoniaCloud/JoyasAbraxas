"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { Suspense } from "react";

function ResultadoContent() {
	const searchParams = useSearchParams();
	const status = searchParams.get("status");
	const { clearCart } = useCart();

	// Limpiar carrito en success/pending (por si el redirect no lo hizo)
	useEffect(() => {
		if (status === "success" || status === "pending") {
			clearCart();
		}
	}, [status, clearCart]);

	if (status === "success") {
		return (
			<section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
				<div className="mb-4 text-5xl">✓</div>
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
				<div className="mb-4 text-5xl">⏳</div>
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

	// failure o status desconocido
	return (
		<section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
			<div className="mb-4 text-5xl">✕</div>
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
