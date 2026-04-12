"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="mx-auto flex min-h-[60vh] max-w-[680px] flex-col items-center justify-center px-4 py-16 text-center">
			<h1 className="mb-2 text-4xl font-light tracking-widest text-[var(--color-brand)]">
				Error
			</h1>
			<p className="mb-6 text-[var(--color-muted)]">
				Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
			</p>
			<div className="flex gap-3">
				<button
					onClick={reset}
					className="cursor-pointer rounded-full border border-[var(--color-line)] bg-transparent px-5 py-2.5 font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-line)]"
				>
					Reintentar
				</button>
				<Link
					href="/"
					className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)]"
				>
					Volver al inicio
				</Link>
			</div>
		</main>
	);
}
