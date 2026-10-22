// Solo se usa en el navegador: reduce las fotos antes de subirlas.
// Al redibujar en un canvas se aplica la orientación EXIF y se descartan los
// metadatos (ubicación GPS incluida) antes de que la foto salga del dispositivo.

const MAX_BYTES_PER_PHOTO = 1.3 * 1024 * 1024; // 3 fotos ≈ 3.9 MB: cabe en el límite de 4.5 MB de Vercel.

// Se prueba de mayor a menor calidad hasta que la foto cabe en el presupuesto.
const ATTEMPTS: { edge: number; quality: number }[] = [
	{ edge: 1600, quality: 0.82 },
	{ edge: 1600, quality: 0.7 },
	{ edge: 1280, quality: 0.7 },
	{ edge: 1024, quality: 0.65 },
];

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
	return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export async function compressImage(file: File): Promise<File> {
	const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
	try {
		let blob: Blob | null = null;
		for (const { edge, quality } of ATTEMPTS) {
			const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
			const canvas = document.createElement("canvas");
			canvas.width = Math.round(bitmap.width * scale);
			canvas.height = Math.round(bitmap.height * scale);
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("canvas no disponible");
			ctx.fillStyle = "#fff"; // los PNG/WebP con transparencia no existen en JPEG
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
			blob = await toBlob(canvas, quality);
			if (blob && blob.size <= MAX_BYTES_PER_PHOTO) break;
		}
		if (!blob || blob.size > MAX_BYTES_PER_PHOTO) throw new Error("no se pudo reducir la foto");
		const base = file.name.replace(/\.[^.]+$/, "") || "foto";
		return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
	} finally {
		bitmap.close();
	}
}
