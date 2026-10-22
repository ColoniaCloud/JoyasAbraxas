// Importa a WordPress las reseñas recuperadas del backup (plugin Abraxas Reviews).
//
//   node --env-file=.env.local scripts/import-reviews.mjs --exclude=28145            # prueba, no escribe nada
//   node --env-file=.env.local scripts/import-reviews.mjs --exclude=28145 --apply    # importa de verdad
//
// Es idempotente: cada reseña lleva su ID original (source_id) y, si ya se importó,
// WordPress la omite. Solo importa las reseñas que tienen producto asociado.
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const exclude = new Set(
	(args.find((a) => a.startsWith("--exclude=")) ?? "--exclude=")
		.slice("--exclude=".length)
		.split(",")
		.filter(Boolean)
		.map(Number),
);

const base = process.env.NEXT_PUBLIC_WP_URL;
const key = process.env.WC_CONSUMER_KEY;
const secret = process.env.WC_CONSUMER_SECRET;
if (!base || !key || !secret) {
	console.error("Faltan NEXT_PUBLIC_WP_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET (usá --env-file=.env.local).");
	process.exit(1);
}

const source = JSON.parse(readFileSync("datos-privados/resenas-site-reviews.json", "utf8"));

const url = new URL("/wp-json/wc/v3/abraxas-reviews/import", base);
url.searchParams.set("consumer_key", key);
url.searchParams.set("consumer_secret", secret);

console.log(apply ? "MODO REAL: se escribirá en WordPress\n" : "PRUEBA (dry-run): no se escribe nada. Agregá --apply para importar.\n");

let created = 0;
let skipped = 0;
let failed = 0;

for (const r of source["reseñas"]) {
	const label = `#${r.id} ${r.autor} ${"★".repeat(r.estrellas)}`;

	if (exclude.has(r.id)) {
		console.log(`- ${label}: excluida`);
		continue;
	}
	const product = r.productos[0];
	if (!product) {
		console.log(`- ${label}: sin producto (va a los testimonios de la portada, no a WooCommerce)`);
		continue;
	}
	if (!r.aprobada) {
		console.log(`- ${label}: no estaba aprobada, se omite`);
		continue;
	}

	if (!apply) {
		console.log(`+ ${label} → ${product.nombre} (#${product.id}), ${r.fecha}`);
		continue;
	}

	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			source_id: `site-reviews-${r.id}`,
			product_id: product.id,
			reviewer: r.autor,
			reviewer_email: r.email,
			rating: r.estrellas,
			review: r.contenido.replace(/\r\n/g, "\n"),
			status: "approved",
			date_created: r.fecha,
			date_created_gmt: r.fecha_gmt,
		}),
	});
	const body = await res.json().catch(() => ({}));

	if (res.ok && body.skipped) {
		skipped++;
		console.log(`= ${label}: ya estaba importada (comentario ${body.id})`);
	} else if (res.ok) {
		created++;
		console.log(`+ ${label} → ${product.nombre}: creada (comentario ${body.id})`);
	} else {
		failed++;
		console.error(`! ${label}: error ${res.status} ${body.code ?? ""} ${body.message ?? ""}`);
	}
}

if (apply) {
	console.log(`\nCreadas: ${created} · Ya existían: ${skipped} · Con error: ${failed}`);

	// Deja los contadores de valoración de todos los productos acordes a las reseñas reales.
	const recountUrl = new URL("/wp-json/wc/v3/abraxas-reviews/recount", base);
	recountUrl.searchParams.set("consumer_key", key);
	recountUrl.searchParams.set("consumer_secret", secret);
	const recount = await fetch(recountUrl, { method: "POST" });
	console.log(recount.ok ? `Contadores recalculados: ${(await recount.json()).recounted} productos` : `! No se pudieron recalcular los contadores (${recount.status})`);
}
process.exit(failed ? 1 : 0);
