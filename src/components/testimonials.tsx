import testimonios from "@/data/testimonios.json";
import { formatReviewDate, summarizeReviews } from "@/lib/reviews";
import StarRating from "@/components/reviews/star-rating";

const SHOWN = 6;

export default function Testimonials() {
	if (testimonios.length === 0) return null;

	const summary = summarizeReviews(testimonios.map((t) => ({ rating: t.estrellas })));

	return (
		<section className="mx-auto max-w-[1080px] px-4 py-14" aria-labelledby="testimonios-titulo">
			<div className="mb-6 flex flex-col items-center gap-2 text-center">
				<h2 id="testimonios-titulo" className="m-0">
					Lo que dicen nuestros clientes
				</h2>
				<div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
					<StarRating value={summary.average} size={18} />
					<span>
						{summary.average.toFixed(1).replace(".", ",")} · {summary.count} reseñas de clientes
					</span>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
				{testimonios.slice(0, SHOWN).map((t) => (
					<figure
						key={t.id}
						className="m-0 flex flex-col gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5"
					>
						<StarRating value={t.estrellas} size={16} />
						<blockquote className="m-0 flex-1 text-sm whitespace-pre-line text-[var(--color-ink)]/90">
							{t.texto}
						</blockquote>
						<figcaption className="text-xs text-[var(--color-muted)]">
							<span className="font-semibold text-[var(--color-ink)]">{t.nombre}</span>
							{t.producto && <> · {t.producto}</>}
							<br />
							<time dateTime={t.fecha}>{formatReviewDate(t.fecha)}</time>
						</figcaption>
					</figure>
				))}
			</div>
		</section>
	);
}
