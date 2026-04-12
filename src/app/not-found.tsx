import Link from "next/link";

export default function NotFound() {
	return (
		<main className="mx-auto flex min-h-[60vh] max-w-[680px] flex-col items-center justify-center px-4 py-16 text-center">
			<h1 className="mb-2 text-6xl font-light tracking-widest text-[var(--color-brand)]">
				404
			</h1>
			<p className="mb-6 text-lg text-[var(--color-muted)]">
				La página que buscas no existe o fue movida.
			</p>
			<Link
				href="/"
				className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-6 py-2.5 font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)]"
			>
				Volver al inicio
			</Link>
		</main>
	);
}
