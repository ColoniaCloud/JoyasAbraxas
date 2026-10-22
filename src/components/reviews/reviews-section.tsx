import { summarizeReviews, type Review } from "@/lib/reviews";
import ReviewForm from "./review-form";
import ReviewList from "./review-list";
import ReviewSummaryCard from "./review-summary";

interface ReviewsSectionProps {
	productId: number;
	productName: string;
	reviews: Review[];
}

export default function ReviewsSection({ productId, productName, reviews }: ReviewsSectionProps) {
	const summary = summarizeReviews(reviews);

	return (
		<section id="resenas" className="mt-10 scroll-mt-24">
			<h2 className="mb-4">Reseñas{summary.count > 0 && ` (${summary.count})`}</h2>

			{summary.count > 0 ? (
				<div className="flex flex-col gap-5">
					<ReviewSummaryCard summary={summary} />
					<ReviewList reviews={reviews} />
				</div>
			) : (
				<p className="mb-4 text-[var(--color-muted)]">
					Todavía no hay reseñas de este producto. ¡Sé la primera persona en dejar la suya!
				</p>
			)}

			<div className="mt-5">
				<ReviewForm productId={productId} productName={productName} />
			</div>
		</section>
	);
}
