import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import NewsletterForm from "@/components/newsletter-form";

const INSTAGRAM_URL = "https://www.instagram.com/joyas.abraxas";
const FACEBOOK_URL =
	"https://www.facebook.com/people/Abraxas-Joyas/100063966942309/";

function InstagramIcon({ size = 18 }: { size?: number }) {
	return (
		<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
			<path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.41-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.17.42-.36 1.04-.41 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.41 2.19.21.55.47.94.88 1.35.41.41.8.67 1.35.88.42.17 1.04.36 2.19.41 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.19-.41.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.17-.42.36-1.04.41-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.41-2.19a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.42-.17-1.04-.36-2.19-.41-1.24-.06-1.61-.07-4.76-.07zm0 2.76a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm0 8.74a3.44 3.44 0 1 0 0-6.88 3.44 3.44 0 0 0 0 6.88zm5.5-8.95a1.24 1.24 0 1 1 0 2.48 1.24 1.24 0 0 1 0-2.48z" />
		</svg>
	);
}

function FacebookIcon({ size = 18 }: { size?: number }) {
	return (
		<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
			<path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
		</svg>
	);
}

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
				{/* Newsletter */}
				<div className="mb-10 border-b border-[var(--color-line)] pb-10">
					<h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]">
						Sumate a nuestra lista
					</h3>
					<p className="mb-3 max-w-[420px] text-sm text-[var(--color-muted)]">
						Recibí novedades, lanzamientos y ofertas exclusivas.
					</p>
					<div className="max-w-[420px]">
						<NewsletterForm />
					</div>
				</div>

				<div className="grid gap-8 sm:grid-cols-3">
					{/* Brand */}
					<div>
						<Link href="/" className="mb-4 inline-block">
							<Image
								src="https://api.joyasabraxas.com/wp-content/uploads/2024/06/logo-blanco.png"
								alt="Abraxas Joyería"
								width={120}
								height={40}
								className="h-10 w-auto object-contain"
							/>
						</Link>
						<p className="text-sm leading-relaxed text-[var(--color-muted)]">
							Joyería artesanal de alta calidad. Cada pieza cuenta una historia.
						</p>
						<div className="mt-4 flex gap-3">
							<a
								href={INSTAGRAM_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Instagram"
								className="flex size-9 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
							>
								<InstagramIcon size={18} />
							</a>
							<a
								href={FACEBOOK_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Facebook"
								className="flex size-9 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
							>
								<FacebookIcon size={18} />
							</a>
						</div>
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
							<li className="flex items-center gap-2">
								<MapPin size={14} className="shrink-0" />
								Montevideo, Uruguay
							</li>
							<li className="flex items-center gap-2">
								<Phone size={14} className="shrink-0" />
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
