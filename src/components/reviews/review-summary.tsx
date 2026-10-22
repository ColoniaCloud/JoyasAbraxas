import type { ReviewSummary } from "@/lib/reviews";
import StarRating from "./star-rating";

export default function ReviewSummaryCard({ summary }: { summary: ReviewSummary }) {
	const { count, average, distribution } = summary;

	return (
		<div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 sm:flex-row sm:items-center sm:gap-8">
			<div className="flex flex-col items-center gap-1 sm:min-w-[130px]">
				<span className="text-5xl leading-none font-bold">{average.toFixed(1).replace(".", ",")}</span>
				<StarRating value={average} size={18} />
				<span className="text-sm text-[var(--color-muted)]">
					{count} {count === 1 ? "reseña" : "reseñas"}
				</span>
			</div>

			<ul className="m-0 flex w-full list-none flex-col gap-1.5 p-0">
				{([5, 4, 3, 2, 1] as const).map((star) => {
					const n = distribution[star];
					const pct = count ? (n / count) * 100 : 0;
					return (
						<li key={star} className="flex items-center gap-2 text-sm">
							<span className="w-10 shrink-0 text-[var(--color-muted)]">{star} ★</span>
							<span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-line)]">
								<span
									className="block h-full rounded-full bg-[var(--color-brand-strong)]"
									style={{ width: `${pct}%` }}
								/>
							</span>
							<span className="w-6 shrink-0 text-right text-[var(--color-muted)]">{n}</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
