import Link from "next/link";

const LINKS = [
	{ href: "/productos", label: "Catálogo" },
	{ href: "/categorias", label: "Categorías" },
	{ href: "/sale", label: "Sale" },
	{ href: "/blog", label: "Blog" },
	{ href: "/nosotros", label: "Nosotros" },
	{ href: "/contacto", label: "Contacto" },
];

export default function Footer() {
	return (
		<footer className="border-t border-[var(--color-line)] bg-[var(--color-panel)]">
			<div className="mx-auto max-w-[1200px] px-6 py-12">
				<div className="grid gap-8 sm:grid-cols-3">
					{/* Brand */}
					<div>
						<h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]">
							Abraxas Joyería
						</h3>
						<p className="text-sm leading-relaxed text-[var(--color-muted)]">
							Joyería artesanal de alta calidad. Cada pieza cuenta una historia.
						</p>
					</div>

					{/* Links */}
					<div>
						<h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]">
							Navegación
						</h3>
						<ul className="flex list-none flex-col gap-2">
							{LINKS.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-brand)]"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Contact */}
					<div>
						<h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]">
							Contacto
						</h3>
						<ul className="flex list-none flex-col gap-2 text-sm text-[var(--color-muted)]">
							<li>📍 Montevideo, Uruguay</li>
							<li>
								📱{" "}
								<a
									href="https://wa.me/59898842100"
									target="_blank"
									rel="noopener noreferrer"
									className="transition-colors hover:text-[var(--color-brand)]"
								>
									+598 98 842 100
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-10 border-t border-[var(--color-line)] pt-6 text-center text-xs text-[var(--color-muted)]">
					© {new Date().getFullYear()} Abraxas Joyería. Todos los derechos reservados.
				</div>
			</div>
		</footer>
	);
}
