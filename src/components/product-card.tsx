import Link from "next/link";
import Image from "next/image";
import type { WPProduct } from "@/lib/types";

interface ProductCardProps {
	product: WPProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
	const hasDiscount =
		product.sale_price &&
		product.regular_price &&
		product.sale_price !== product.regular_price;

	const discount = hasDiscount
		? Math.round(
				(1 - Number(product.sale_price) / Number(product.regular_price)) * 100,
			)
		: 0;

	return (
		<Link
			href={`/productos/${product.slug}`}
			className="group overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
		>
			<div className="relative aspect-square w-full overflow-hidden bg-[#1c1a18]">
				{product.images[0] ? (
					<Image
						src={product.images[0].src}
						alt={product.images[0].alt || product.name}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-105"
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
					/>
				) : (
					<div className="flex h-full items-center justify-center text-4xl text-[var(--color-muted)]">
						{product.name.charAt(0)}
					</div>
				)}
				{discount > 0 && (
					<span className="absolute top-2 left-2 rounded-full bg-[var(--color-brand)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-panel)]">
						-{discount}%
					</span>
				)}
			</div>
			<div className="p-4">
				<p className="mb-2 line-clamp-2 text-sm font-medium text-[var(--color-ink)]">
					{product.name}
				</p>
				<div className="flex items-baseline gap-2">
					{hasDiscount ? (
						<>
							<span className="text-base font-bold text-[var(--color-brand-strong)]">
								${product.sale_price}
							</span>
							<span className="text-sm text-[var(--color-muted)] line-through">
								${product.regular_price}
							</span>
						</>
					) : (
						<span className="text-base font-bold">
							{product.price ? `$${product.price}` : "Sin precio"}
						</span>
					)}
				</div>
			</div>
		</Link>
	);
}
