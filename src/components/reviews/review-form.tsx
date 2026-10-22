"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { compressImage } from "@/lib/image-compress";
import { REVIEW_LIMITS, REVIEW_PHOTO_TYPES } from "@/lib/reviews";

interface PickedPhoto {
	id: string;
	file: File;
	preview: string;
}

const FIELD =
	"w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-background)] px-3 py-2 text-base text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand)] sm:text-sm";

const STAR_PATH =
	"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

interface ReviewFormProps {
	productId: number;
	productName: string;
	/** En la página dedicada el formulario arranca abierto y no tiene «Cancelar». */
	standalone?: boolean;
	/** Se muestra debajo del mensaje de agradecimiento (p. ej. «Reseñar otro producto»). */
	successAction?: ReactNode;
}

export default function ReviewForm({ productId, productName, standalone = false, successAction }: ReviewFormProps) {
	const [open, setOpen] = useState(standalone);
	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [review, setReview] = useState("");
	const [consent, setConsent] = useState(false);
	const [photos, setPhotos] = useState<PickedPhoto[]>([]);
	const [processing, setProcessing] = useState(false);
	const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
	const [message, setMessage] = useState("");
	const startedAt = useRef(0);
	const previews = useRef<string[]>([]);

	useEffect(() => {
		const urls = previews.current;
		return () => urls.forEach((url) => URL.revokeObjectURL(url));
	}, []);

	// En modo página el formulario ya está abierto: el reloj anti-bots corre desde el montaje.
	useEffect(() => {
		if (standalone) startedAt.current = Date.now();
	}, [standalone]);

	function openForm() {
		startedAt.current = Date.now();
		setOpen(true);
	}

	async function onPickPhotos(e: ChangeEvent<HTMLInputElement>) {
		const input = e.target;
		const picked = Array.from(input.files ?? []);
		input.value = "";
		if (!picked.length) return;

		const room = REVIEW_LIMITS.maxPhotos - photos.length;
		if (room <= 0) {
			setMessage(`Podés subir hasta ${REVIEW_LIMITS.maxPhotos} fotos.`);
			return;
		}

		setProcessing(true);
		setMessage("");
		const added: PickedPhoto[] = [];
		for (const file of picked.slice(0, room)) {
			if (!(REVIEW_PHOTO_TYPES as readonly string[]).includes(file.type)) {
				setMessage("Las fotos deben ser JPG, PNG o WebP.");
				continue;
			}
			try {
				const compressed = await compressImage(file);
				const preview = URL.createObjectURL(compressed);
				previews.current.push(preview);
				added.push({ id: `${Date.now()}-${added.length}`, file: compressed, preview });
			} catch {
				setMessage("No pudimos procesar una de las fotos. Probá con otra.");
			}
		}
		if (picked.length > room) setMessage(`Solo entran ${REVIEW_LIMITS.maxPhotos} fotos por reseña.`);
		setPhotos((prev) => [...prev, ...added]);
		setProcessing(false);
	}

	function removePhoto(id: string) {
		setPhotos((prev) => prev.filter((p) => p.id !== id));
	}

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (rating < 1) {
			setStatus("error");
			setMessage("Elegí de 1 a 5 estrellas.");
			return;
		}

		setStatus("sending");
		setMessage("");

		const data = new FormData();
		data.set("productId", String(productId));
		data.set("name", name);
		data.set("email", email);
		data.set("rating", String(rating));
		data.set("review", review);
		data.set("consent", consent ? "1" : "0");
		data.set("startedAt", String(startedAt.current));
		data.set("website", (e.currentTarget.elements.namedItem("website") as HTMLInputElement).value);
		photos.forEach((p) => data.append("photos", p.file, p.file.name));

		try {
			const res = await fetch("/api/reviews", { method: "POST", body: data });
			const json = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(json.error || "No pudimos enviar tu reseña. Probá más tarde.");
			setStatus("ok");
		} catch (err) {
			setStatus("error");
			setMessage(err instanceof Error ? err.message : "No pudimos enviar tu reseña. Probá más tarde.");
		}
	}

	if (status === "ok") {
		return (
			<div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
				<p className="m-0 font-semibold">¡Gracias por tu reseña! 💌</p>
				<p className="m-0 mt-1 text-sm text-[var(--color-muted)]">
					La vamos a revisar y la publicamos en cuanto esté aprobada.
				</p>
				{successAction && <div className="mt-4">{successAction}</div>}
			</div>
		);
	}

	if (!open) {
		return (
			<button
				type="button"
				onClick={openForm}
				className="cursor-pointer rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)]"
			>
				Escribir una reseña
			</button>
		);
	}

	const shownRating = hover || rating;

	return (
		<form
			onSubmit={onSubmit}
			className="flex flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5"
		>
			<h3 className="m-0 text-lg">Tu reseña de {productName}</h3>

			<div>
				<span className="mb-1 block text-sm font-medium">Tu valoración</span>
				<div role="radiogroup" aria-label="Valoración" className="flex gap-1" onMouseLeave={() => setHover(0)}>
					{[1, 2, 3, 4, 5].map((n) => (
						<button
							key={n}
							type="button"
							role="radio"
							aria-checked={rating === n}
							aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
							onClick={() => setRating(n)}
							onMouseEnter={() => setHover(n)}
							className="cursor-pointer p-0.5"
						>
							<svg
								width="30"
								height="30"
								viewBox="0 0 24 24"
								fill={n <= shownRating ? "var(--color-brand-strong)" : "#3a3431"}
								aria-hidden="true"
							>
								<path d={STAR_PATH} />
							</svg>
						</button>
					))}
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<label className="flex flex-col gap-1 text-sm font-medium">
					Nombre <span className="font-normal text-[var(--color-muted)]">(visible al público)</span>
					<input
						type="text"
						required
						minLength={REVIEW_LIMITS.nameMin}
						maxLength={REVIEW_LIMITS.nameMax}
						value={name}
						onChange={(e) => setName(e.target.value)}
						autoComplete="given-name"
						className={FIELD}
					/>
				</label>
				<label className="flex flex-col gap-1 text-sm font-medium">
					Email <span className="font-normal text-[var(--color-muted)]">(no se publica)</span>
					<input
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
						className={FIELD}
					/>
				</label>
			</div>

			<label className="flex flex-col gap-1 text-sm font-medium">
				Tu experiencia
				<textarea
					required
					rows={4}
					minLength={REVIEW_LIMITS.textMin}
					maxLength={REVIEW_LIMITS.textMax}
					value={review}
					onChange={(e) => setReview(e.target.value)}
					placeholder="¿Cómo es la pieza? ¿Cómo fue la atención?"
					className={FIELD}
				/>
			</label>

			<div>
				<span className="mb-1 block text-sm font-medium">
					Fotos <span className="font-normal text-[var(--color-muted)]">(opcional, hasta {REVIEW_LIMITS.maxPhotos})</span>
				</span>
				<div className="flex flex-wrap items-center gap-2">
					{photos.map((p) => (
						<div key={p.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--color-line)]">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={p.preview} alt="Vista previa de la foto" className="h-full w-full object-cover" />
							<button
								type="button"
								onClick={() => removePhoto(p.id)}
								aria-label="Quitar foto"
								className="absolute top-1 right-1 h-6 w-6 cursor-pointer rounded-full bg-black/70 text-xs leading-none text-white"
							>
								✕
							</button>
						</div>
					))}
					{photos.length < REVIEW_LIMITS.maxPhotos && (
						<label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[var(--color-muted)] text-center text-xs text-[var(--color-muted)] transition-colors hover:border-[var(--color-brand)]">
							{processing ? "..." : "+ Foto"}
							<input
								type="file"
								accept="image/jpeg,image/png,image/webp"
								multiple
								onChange={onPickPhotos}
								disabled={processing}
								className="sr-only"
							/>
						</label>
					)}
				</div>
			</div>

			{/* Honeypot: invisible para personas, los bots lo completan. */}
			<div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
				<label>
					No completar
					<input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
				</label>
			</div>

			<label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
				<input
					type="checkbox"
					required
					checked={consent}
					onChange={(e) => setConsent(e.target.checked)}
					className="mt-0.5 accent-[var(--color-brand)]"
				/>
				Acepto que mi nombre, mi reseña y mis fotos se publiquen en el sitio.
			</label>

			{message && (
				<p role="alert" className="m-0 text-sm text-red-400">
					{message}
				</p>
			)}

			<div className="flex gap-2">
				<button
					type="submit"
					disabled={status === "sending" || processing}
					className="cursor-pointer rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)] disabled:opacity-60"
				>
					{status === "sending" ? "Enviando..." : "Enviar reseña"}
				</button>
				{!standalone && (
					<button
						type="button"
						onClick={() => setOpen(false)}
						className="cursor-pointer rounded-lg border border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold"
					>
						Cancelar
					</button>
				)}
			</div>
		</form>
	);
}
