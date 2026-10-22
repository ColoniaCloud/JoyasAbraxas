// Genera src/data/testimonios.json (público, sin emails) a partir del JSON recuperado
// del backup en datos-privados/. Uso:
//   node scripts/build-testimonials.mjs --exclude=28145
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const exclude = new Set(
	(process.argv.find((a) => a.startsWith("--exclude=")) ?? "--exclude=")
		.slice("--exclude=".length)
		.split(",")
		.filter(Boolean)
		.map(Number),
);

const source = JSON.parse(readFileSync("datos-privados/resenas-site-reviews.json", "utf8"));

const testimonios = source["reseñas"]
	.filter((r) => r.aprobada && !exclude.has(r.id))
	.map((r) => ({
		id: r.id,
		nombre: r.autor,
		estrellas: r.estrellas,
		fecha: r.fecha.slice(0, 10),
		texto: r.contenido.replace(/\r\n/g, "\n").trim(),
		producto: r.productos[0]?.nombre ?? null,
	}))
	.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/testimonios.json", JSON.stringify(testimonios, null, 2) + "\n");
console.log(`${testimonios.length} testimonios escritos (excluidos: ${[...exclude].join(", ") || "ninguno"})`);
