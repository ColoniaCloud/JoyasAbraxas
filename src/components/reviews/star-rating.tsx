const STAR_PATH =
	"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

function StarRow({ size, color }: { size: number; color: string }) {
	return (
		<span className="flex w-max" aria-hidden="true">
			{Array.from({ length: 5 }, (_, i) => (
				<svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={color} className="shrink-0">
					<path d={STAR_PATH} />
				</svg>
			))}
		</span>
	);
}

interface StarRatingProps {
	/** 0–5, admite decimales (4.3 pinta el 86 % del ancho). */
	value: number;
	size?: number;
	className?: string;
}

export default function StarRating({ value, size = 16, className }: StarRatingProps) {
	const pct = Math.max(0, Math.min(100, (value / 5) * 100));
	return (
		<span
			role="img"
			aria-label={`${value.toFixed(1)} de 5 estrellas`}
			className={`relative inline-flex ${className ?? ""}`}
		>
			<StarRow size={size} color="#3a3431" />
			<span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
				<StarRow size={size} color="var(--color-brand-strong)" />
			</span>
		</span>
	);
}
