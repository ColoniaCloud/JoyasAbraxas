import { NextResponse } from "next/server";
import { REVIEW_LIMITS, REVIEW_PHOTO_TYPES } from "@/lib/reviews";

export const runtime = "nodejs";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Anti-spam: un formulario real tarda más que esto en completarse.
const MIN_FILL_MS = 3000;

// Límite por IP en memoria. En serverless cada instancia lleva su propia cuenta,
// así que es una barrera básica; el tope duro es la moderación y la regla de
// «una reseña por email y producto» que aplica el plugin de WordPress.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const attempts = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
	if (recent.length >= MAX_PER_WINDOW) {
		attempts.set(ip, recent);
		return true;
	}
	recent.push(now);
	attempts.set(ip, recent);
	if (attempts.size > 5000) {
		for (const [key, times] of attempts) {
			if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(key);
		}
	}
	return false;
}

function fail(error: string, status: number) {
	return NextResponse.json({ error }, { status });
}

function text(form: FormData, key: string): string {
	const value = form.get(key);
	return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
	if (!WP_URL || !WC_KEY || !WC_SECRET) {
		console.error("[reviews] Faltan NEXT_PUBLIC_WP_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET");
		return fail("No pudimos enviar tu reseña ahora. Probá más tarde.", 500);
	}

	let form: FormData;
	try {
		form = await req.formData();
	} catch {
		return fail("Solicitud inválida", 400);
	}

	// Honeypot y tiempo mínimo: a los bots se les responde «ok» sin hacer nada.
	const startedAt = Number(text(form, "startedAt"));
	if (text(form, "website") !== "" || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
		return NextResponse.json({ ok: true });
	}

	const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
	if (isRateLimited(ip)) {
		return fail("Enviaste varias reseñas seguidas. Probá de nuevo más tarde.", 429);
	}

	const productId = Number(text(form, "productId"));
	const name = text(form, "name");
	const email = text(form, "email");
	const rating = Number(text(form, "rating"));
	const review = text(form, "review");

	if (!Number.isInteger(productId) || productId < 1) return fail("Producto inválido", 400);
	if (name.length < REVIEW_LIMITS.nameMin || name.length > REVIEW_LIMITS.nameMax) {
		return fail("Ingresá tu nombre.", 400);
	}
	if (!EMAIL_RE.test(email)) return fail("Ingresá un email válido.", 400);
	if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Elegí de 1 a 5 estrellas.", 400);
	if (review.length < REVIEW_LIMITS.textMin || review.length > REVIEW_LIMITS.textMax) {
		return fail(`Contanos tu experiencia (entre ${REVIEW_LIMITS.textMin} y ${REVIEW_LIMITS.textMax} caracteres).`, 400);
	}
	if (text(form, "consent") !== "1") return fail("Tenés que aceptar que publiquemos tu reseña.", 400);

	const photos = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
	if (photos.length > REVIEW_LIMITS.maxPhotos) {
		return fail(`Podés subir hasta ${REVIEW_LIMITS.maxPhotos} fotos.`, 400);
	}
	for (const photo of photos) {
		if (!(REVIEW_PHOTO_TYPES as readonly string[]).includes(photo.type)) {
			return fail("Las fotos deben ser JPG, PNG o WebP.", 400);
		}
		if (photo.size > REVIEW_LIMITS.maxPhotoBytes) return fail("Una de las fotos pesa demasiado.", 413);
	}

	const body = new FormData();
	body.set("product_id", String(productId));
	body.set("reviewer", name);
	body.set("reviewer_email", email);
	body.set("rating", String(rating));
	body.set("review", review);
	body.set("consent", "1");
	body.set("client_ip", ip);
	for (const photo of photos) {
		body.append("photos[]", new Blob([await photo.arrayBuffer()], { type: photo.type }), photo.name || "foto.jpg");
	}

	const url = new URL("/wp-json/wc/v3/abraxas-reviews", WP_URL);
	url.searchParams.set("consumer_key", WC_KEY);
	url.searchParams.set("consumer_secret", WC_SECRET);

	let res: Response;
	try {
		res = await fetch(url, { method: "POST", body, cache: "no-store" });
	} catch (e) {
		console.error("[reviews] fallo de red al enviar a WordPress:", e);
		return fail("No pudimos enviar tu reseña ahora. Probá más tarde.", 502);
	}

	const raw = await res.text();
	let data: { code?: string; message?: string } = {};
	try {
		data = JSON.parse(raw);
	} catch {
		// WordPress devolvió algo que no es JSON; se trata como error del servidor.
	}

	if (res.status === 201) return NextResponse.json({ ok: true }, { status: 201 });

	// Los errores del plugin (código abraxas_*) traen un mensaje pensado para el cliente.
	if (data.code?.startsWith("abraxas_") && data.message && [400, 404, 409, 413, 415].includes(res.status)) {
		return fail(data.message, res.status === 404 ? 400 : res.status);
	}

	console.error(`[reviews] WordPress respondió ${res.status}: ${raw.slice(0, 300)}`);
	return fail("No pudimos enviar tu reseña ahora. Probá más tarde.", 502);
}
