// Genera el script de Scripter (Figma) para la guirnalda «Joyero» de Fiestas.
// Copia tal cual el generador de la web (src/lib/guirnalda-joyero.ts), así Figma
// dibuja exactamente la misma guirnalda que el sitio.
//
// Uso:  node scripts/build-figma-guirnalda.mjs
// Salida: figma/guirnalda-joyero.scripter.ts → pegar su contenido en Scripter y ejecutar.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const fuente = readFileSync(join(raiz, "src/lib/guirnalda-joyero.ts"), "utf8");

// Scripter ejecuta un único archivo: se quitan los `export` y queda todo en el mismo ámbito.
const generador = fuente.replace(/^export\s+/gm, "");

const figma = `
// ─────────────────────────────────────────────────────────────────────────────
// Dibuja en la página actual una guirnalda por variante, como vectores editables.
// Las sombras van como efecto nativo de Figma (no como filtro SVG).
// ─────────────────────────────────────────────────────────────────────────────
const NOMBRES: Record<string, string> = {
  post: "Guirnalda Joyero · post y carrusel 1080",
  historia: "Guirnalda Joyero · historia 1080×1920 (respeta 250px arriba)",
  escritorio: "Guirnalda Joyero · web escritorio 1440",
  celular: "Guirnalda Joyero · web celular 400",
};

let x = figma.viewport.center.x;
const y = figma.viewport.center.y;
const creados: SceneNode[] = [];

for (const clave of ["post", "historia", "escritorio", "celular"] as const) {
  const svg = guirnaldaJoyeroSvg({ ...VARIANTES_JOYERO[clave], sombras: false });
  const nodo = figma.createNodeFromSvg(svg);
  nodo.name = NOMBRES[clave];
  nodo.fills = [];
  nodo.clipsContent = false;
  nodo.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.5 },
      offset: { x: 0, y: 2 * (VARIANTES_JOYERO[clave].escala ?? 1) },
      radius: 4 * (VARIANTES_JOYERO[clave].escala ?? 1),
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
      showShadowBehindNode: false,
    },
  ];
  nodo.x = x;
  nodo.y = y;
  x += nodo.width + 120;
  figma.currentPage.appendChild(nodo);
  creados.push(nodo);
}

figma.currentPage.selection = creados;
figma.viewport.scrollAndZoomIntoView(creados);
print("Listo: " + creados.length + " guirnaldas creadas. Colores: ", COLORES_JOYERO);
`;

const salida = join(raiz, "figma/guirnalda-joyero.scripter.ts");
mkdirSync(dirname(salida), { recursive: true });
writeFileSync(
  salida,
  `// GENERADO por scripts/build-figma-guirnalda.mjs a partir de src/lib/guirnalda-joyero.ts.\n` +
    `// No editar a mano: cambiá el generador y volvé a correr el script.\n\n` +
    generador +
    figma,
);
console.log("✓ " + salida);
