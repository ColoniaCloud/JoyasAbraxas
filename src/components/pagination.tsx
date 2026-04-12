import Link from "next/link";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
	if (totalPages <= 1) return null;

	const pages: (number | "ellipsis")[] = [];

	for (let i = 1; i <= totalPages; i++) {
		if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
			pages.push(i);
		} else if (pages[pages.length - 1] !== "ellipsis") {
			pages.push("ellipsis");
		}
	}

	function href(page: number) {
		return page === 1 ? basePath : `${basePath}?pagina=${page}`;
	}

	return (
		<nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-1">
			{currentPage > 1 && (
				<Link
					href={href(currentPage - 1)}
					className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm transition-colors hover:bg-[var(--color-line)]"
				>
					Anterior
				</Link>
			)}

			{pages.map((p, i) =>
				p === "ellipsis" ? (
					<span key={`e${i}`} className="px-2 text-[var(--color-muted)]">
						…
					</span>
				) : (
					<Link
						key={p}
						href={href(p)}
						className={`min-w-[36px] rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
							p === currentPage
								? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
								: "border-[var(--color-line)] hover:bg-[var(--color-line)]"
						}`}
					>
						{p}
					</Link>
				),
			)}

			{currentPage < totalPages && (
				<Link
					href={href(currentPage + 1)}
					className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm transition-colors hover:bg-[var(--color-line)]"
				>
					Siguiente
				</Link>
			)}
		</nav>
	);
}
