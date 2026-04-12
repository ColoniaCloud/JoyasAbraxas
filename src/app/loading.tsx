export default function Loading() {
	return (
		<main className="flex min-h-[60vh] items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<div className="size-10 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-brand)]" />
				<p className="text-sm tracking-widest text-[var(--color-muted)] uppercase">
					Cargando...
				</p>
			</div>
		</main>
	);
}
