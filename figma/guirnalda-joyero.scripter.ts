// GENERADO por scripts/build-figma-guirnalda.mjs a partir de src/lib/guirnalda-joyero.ts.
// No editar a mano: cambiá el generador y volvé a correr el script.

/**
 * Guirnalda «Joyero» de Fiestas: cadenas de oro en dos hileras con perlas y
 * estrellas facetadas colgando de cadenitas.
 *
 * Fuente única: la web la renderiza con este generador y el script de Figma
 * (scripts/build-figma-guirnalda.mjs) copia este mismo archivo, así que la
 * guirnalda de redes es idéntica a la del sitio. Sin imports ni azar a propósito.
 */

interface EstrellaColgante {
  /** Posición horizontal, de 0 a 1 sobre el ancho */
  x: number;
  /** Largo de la cadenita desde el punto más bajo del tramo */
  hilo: number;
  /** Radio de la estrella */
  r: number;
}

interface GuirnaldaOpts {
  ancho: number;
  alto: number;
  /** Cantidad de ondas de cadena */
  tramos: number;
  /** Altura de los ganchos */
  y: number;
  /** Cuánto cae cada onda */
  caida: number;
  /** Multiplica grosores, perlas y eslabones (1 = web de escritorio) */
  escala?: number;
  estrellas: EstrellaColgante[];
  /** Prefijo para los ids de degradés (evita choques si hay dos SVG en la página) */
  id: string;
  /** Sombras con filtro SVG. En Figma van como efecto nativo, así que se apagan. */
  sombras?: boolean;
  /** Clase para las estrellas (la web las balancea con CSS) */
  claseEstrella?: string;
}

const COLORES_JOYERO = {
  oroLuz: "#f2e2bb",
  oro: "#dcc08a",
  oroMedio: "#b8955c",
  oroSombra: "#8f6f40",
  perla: "#f6f0e6",
};

type Punto = [number, number];

const f = (n: number) => Number(n.toFixed(1));

function curva(x0: number, x1: number, y: number, caida: number, paso: number): Punto[] {
  const n = Math.max(2, Math.round((x1 - x0) / paso));
  const pts: Punto[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([x0 + (x1 - x0) * t, y + caida * 4 * t * (1 - t)]);
  }
  return pts;
}

/** Eslabones alternados: uno de frente (óvalo) y uno de canto (trazo), con brillo que recorre la cadena */
function cadena(pts: Punto[], s: number): string {
  const tonos = [COLORES_JOYERO.oroLuz, COLORES_JOYERO.oro, COLORES_JOYERO.oroMedio, COLORES_JOYERO.oroSombra];
  let acum = 0;
  let out = "";
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    acum += Math.hypot(x1 - x0, y1 - y0);
    const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    const color = tonos[Math.floor((Math.sin(acum / 23) * 0.5 + 0.5) * 3.99)];
    const cx = f((x0 + x1) / 2);
    const cy = f((y0 + y1) / 2);
    out +=
      i % 2
        ? `<ellipse cx="${cx}" cy="${cy}" rx="${f(4.4 * s)}" ry="${f(2.6 * s)}" fill="none" stroke="${color}" stroke-width="${f(1.4 * s)}" transform="rotate(${f(ang)} ${cx} ${cy})"/>`
        : `<line x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}" stroke="${color}" stroke-width="${f(1.6 * s)}" stroke-linecap="round"/>`;
  }
  return out;
}

/** Estrella de 5 puntas facetada: cada punta tiene una cara clara y una oscura, como oro biselado */
function estrella(cx: number, cy: number, R: number, id: string, sombra: string): string {
  const r = R * 0.42;
  const P: Punto[] = [];
  for (let j = 0; j < 10; j++) {
    const a = -Math.PI / 2 + (j * Math.PI) / 5;
    const rr = j % 2 ? r : R;
    P.push([f(cx + Math.cos(a) * rr), f(cy + Math.sin(a) * rr)]);
  }
  let caras = "";
  for (let j = 0; j < 10; j += 2) {
    const tip = P[j];
    const izq = P[(j + 9) % 10];
    const der = P[j + 1];
    caras += `<polygon points="${f(cx)},${f(cy)} ${izq} ${tip}" fill="url(#${id}-cara)"/>`;
    caras += `<polygon points="${f(cx)},${f(cy)} ${tip} ${der}" fill="url(#${id}-sombra)"/>`;
  }
  return (
    `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 1.9)}" fill="url(#${id}-halo)"/>` +
    `<g${sombra}>${caras}<polygon points="${P.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${COLORES_JOYERO.oroLuz}" stroke-width="0.6" opacity="0.7"/></g>`
  );
}

function guirnaldaJoyeroSvg(o: GuirnaldaOpts): string {
  const s = o.escala ?? 1;
  const id = o.id;
  const sombra = o.sombras === false ? "" : ` filter="url(#${id}-ds)"`;
  const tramo = o.ancho / o.tramos;

  const defs =
    `<defs>` +
    `<linearGradient id="${id}-cara" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e7c1"/><stop offset=".35" stop-color="#dcc08a"/><stop offset=".7" stop-color="#b38f55"/><stop offset="1" stop-color="#8a6a3a"/></linearGradient>` +
    `<linearGradient id="${id}-sombra" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a76a"/><stop offset=".5" stop-color="#9a7745"/><stop offset="1" stop-color="#6e5130"/></linearGradient>` +
    `<radialGradient id="${id}-perla" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#f6f0e6"/><stop offset=".7" stop-color="#d9cfc0"/><stop offset="1" stop-color="#a89c8b"/></radialGradient>` +
    `<radialGradient id="${id}-halo"><stop offset="0" stop-color="#f3dfb3" stop-opacity=".3"/><stop offset="1" stop-color="#f3dfb3" stop-opacity="0"/></radialGradient>` +
    (o.sombras === false
      ? ""
      : `<filter id="${id}-ds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="${f(2 * s)}" stdDeviation="${f(2 * s)}" flood-color="#000" flood-opacity=".55"/></filter>`) +
    `</defs>`;

  // Dos hileras: la de atrás más corta y transparente, para dar profundidad
  let hileras = "";
  for (let capa = 0; capa < 2; capa++) {
    const caida = capa ? o.caida : o.caida * 0.55;
    let g = "";
    for (let i = 0; i < o.tramos; i++) {
      const pts = curva(i * tramo, (i + 1) * tramo, o.y, caida, 8 * s);
      g += cadena(pts, s);
      if (capa) {
        for (let k = 3; k < pts.length - 2; k += 7) {
          g += `<circle cx="${f(pts[k][0])}" cy="${f(pts[k][1] + s)}" r="${f(3.6 * s)}" fill="url(#${id}-perla)"${sombra}/>`;
        }
      }
    }
    hileras += `<g${capa ? "" : ' opacity="0.55"'}>${g}</g>`;
  }

  // Estrellas colgando del punto más bajo de su tramo
  let estrellas = "";
  for (const e of o.estrellas) {
    const x = e.x * o.ancho;
    const t = (x % tramo) / tramo;
    const yIni = o.y + o.caida * 4 * t * (1 - t);
    const vert: Punto[] = [];
    for (let y = yIni; y <= yIni + e.hilo; y += 6 * s) vert.push([x, y]);
    const cy = yIni + e.hilo + e.r + 4 * s;
    const clase = o.claseEstrella ? ` class="${o.claseEstrella}" style="transform-origin:${f(x)}px ${f(yIni)}px"` : "";
    estrellas +=
      `<g${clase}>` +
      cadena(vert, s * 0.7) +
      `<circle cx="${f(x)}" cy="${f(yIni + e.hilo + 2 * s)}" r="${f(2.6 * s)}" fill="url(#${id}-perla)"/>` +
      estrella(x, cy, e.r, id, sombra) +
      `</g>`;
  }

  // Broches en los ganchos: perla grande con casquillo de oro
  let broches = "";
  for (let i = 0; i <= o.tramos; i++) {
    const x = i * tramo;
    broches +=
      `<circle cx="${f(x)}" cy="${f(o.y)}" r="${f(7 * s)}" fill="url(#${id}-perla)"${sombra}/>` +
      `<path d="M ${f(x - 5 * s)} ${f(o.y - 5 * s)} Q ${f(x)} ${f(o.y - 10 * s)} ${f(x + 5 * s)} ${f(o.y - 5 * s)}" fill="none" stroke="${COLORES_JOYERO.oro}" stroke-width="${f(2 * s)}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${o.ancho} ${o.alto}" width="${o.ancho}" height="${o.alto}">${defs}${hileras}${estrellas}${broches}</svg>`;
}

/** Una estrella facetada suelta (la misma de la guirnalda), para usar flotando o como sello en redes */
function estrellaSueltaSvg(id: string): string {
  const R = 20;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 80 80" width="80" height="80">` +
    `<defs>` +
    `<linearGradient id="${id}-cara" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e7c1"/><stop offset=".35" stop-color="#dcc08a"/><stop offset=".7" stop-color="#b38f55"/><stop offset="1" stop-color="#8a6a3a"/></linearGradient>` +
    `<linearGradient id="${id}-sombra" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a76a"/><stop offset=".5" stop-color="#9a7745"/><stop offset="1" stop-color="#6e5130"/></linearGradient>` +
    `<radialGradient id="${id}-halo"><stop offset="0" stop-color="#f3dfb3" stop-opacity=".3"/><stop offset="1" stop-color="#f3dfb3" stop-opacity="0"/></radialGradient>` +
    `</defs>` +
    estrella(0, 0, R, id, "") +
    `</svg>`
  );
}

/** Variantes listas para usar (web escritorio, web celular y piezas de redes) */
const VARIANTES_JOYERO: Record<"escritorio" | "celular" | "post" | "historia", GuirnaldaOpts> = {
  escritorio: {
    id: "gj-d", ancho: 1440, alto: 240, tramos: 4, y: 10, caida: 44,
    estrellas: [ { x: 0.125, hilo: 34, r: 20 }, { x: 0.375, hilo: 64, r: 25 }, { x: 0.625, hilo: 40, r: 20 }, { x: 0.875, hilo: 70, r: 24 } ],
  },
  celular: {
    id: "gj-m", ancho: 400, alto: 170, tramos: 2, y: 8, caida: 34, escala: 0.9,
    estrellas: [ { x: 0.25, hilo: 28, r: 14 }, { x: 0.75, hilo: 52, r: 16 } ],
  },
  post: {
    id: "gj-post", ancho: 1080, alto: 420, tramos: 2, y: 16, caida: 90, escala: 1.7,
    estrellas: [ { x: 0.25, hilo: 60, r: 28 }, { x: 0.75, hilo: 120, r: 34 } ],
  },
  historia: {
    id: "gj-story", ancho: 1080, alto: 560, tramos: 2, y: 250, caida: 90, escala: 1.7,
    estrellas: [ { x: 0.25, hilo: 60, r: 28 }, { x: 0.75, hilo: 120, r: 34 } ],
  },
};

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
