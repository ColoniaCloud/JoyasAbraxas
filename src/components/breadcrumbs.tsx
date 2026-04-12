import Link from "next/link";

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
	return (
		<nav aria-label="Breadcrumb" className="mb-5 text-sm text-[var(--color-muted)]">
			<ol className="flex flex-wrap items-center gap-1">
				{items.map((item, i) => {
					const isLast = i === items.length - 1;
					return (
						<li key={i} className="flex items-center gap-1">
							{i > 0 && <span aria-hidden="true">/</span>}
							{isLast || !item.href ? (
								<span className="text-[var(--color-ink)]">{item.label}</span>
							) : (
								<Link
									href={item.href}
									className="transition-colors hover:text-[var(--color-brand-strong)]"
								>
									{item.label}
								</Link>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
