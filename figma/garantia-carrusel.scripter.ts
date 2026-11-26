// Carrusel de Instagram · Garantía Abraxas (3 slides de 1080×1350)
//
// Uso: abrir Scripter en Figma, pegar este archivo y ejecutar. Crea los 3 frames
// en la página actual, uno al lado del otro.
//
// Fondo: la misma foto de la sección de garantía de la web (colgante sobre camisa
// clara), como UNA sola imagen panorámica de 3240px de ancho recortada en tres:
// cada frame muestra su tercio, así al deslizar el fondo continúa sin cortes.
// Estética más limpia y clara que la web: marfil, tinta cálida y acento coral.

const FOTO_URL = "https://www.joyasabraxas.com/ornament/slider/colgantes.jpg";
const FOTO_PROPORCION = 3150 / 2520; // alto / ancho del original

const W = 1080;
const H = 1350;
const GAP = 60; // separación visual entre frames en el lienzo (no afecta el recorte)
const SLIDES = 3;

// Fondo continuo: ancho total del carrusel, alto proporcional a la foto.
const FONDO_W = W * SLIDES;
const FONDO_H = FONDO_W * FOTO_PROPORCION;
// Corrimiento vertical: deja el colgante a media altura del frame 2.
const FONDO_Y = -1120;

const C = {
  marfil: "#F8F4EE",
  tinta: "#2B2220",
  tintaSuave: "#7A6E66",
  coral: "#C05046",
  linea: "#E4DAD0",
  blanco: "#FFFFFF",
};

// ── utilidades ───────────────────────────────────────────────────────────────

function rgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function solido(hex: string, opacity = 1): SolidPaint {
  return { type: "SOLID", color: rgb(hex), opacity };
}

/** Degradé marfil → transparente para dar legibilidad sin oscurecer la foto */
function velo(angulo: "izquierda" | "derecha" | "abajo", fuerza = 0.85): GradientPaint {
  const transformaciones: Record<string, Transform> = {
    izquierda: [[1, 0, 0], [0, 1, 0]],
    derecha: [[-1, 0, 1], [0, 1, 0]],
    abajo: [[0, -1, 1], [1, 0, 0]],
  };
  return {
    type: "GRADIENT_LINEAR",
    gradientTransform: transformaciones[angulo],
    gradientStops: [
      { position: 0, color: { ...rgb(C.marfil), a: fuerza } },
      { position: 0.55, color: { ...rgb(C.marfil), a: fuerza * 0.35 } },
      { position: 1, color: { ...rgb(C.marfil), a: 0 } },
    ],
  };
}

async function fuente(familia: string, estilo: string, alternativa: FontName): Promise<FontName> {
  try {
    await figma.loadFontAsync({ family: familia, style: estilo });
    return { family: familia, style: estilo };
  } catch {
    await figma.loadFontAsync(alternativa);
    return alternativa;
  }
}

const SERIF_LIGHT = await fuente("Cormorant Garamond", "Light", { family: "Inter", style: "Light" });
const SERIF = await fuente("Cormorant Garamond", "Regular", { family: "Inter", style: "Regular" });
const SERIF_ITALIC = await fuente("Cormorant Garamond", "Italic", { family: "Inter", style: "Regular" });
const SANS = await fuente("Geist", "Regular", { family: "Inter", style: "Regular" });
const SANS_MEDIUM = await fuente("Geist", "Medium", { family: "Inter", style: "Medium" });

interface TextoOpts {
  x: number;
  y: number;
  size: number;
  font: FontName;
  color?: string;
  width?: number;
  tracking?: number; // en %
  lineHeight?: number; // en %
  align?: "LEFT" | "CENTER" | "RIGHT";
  nombre?: string;
}

function texto(padre: FrameNode, contenido: string, o: TextoOpts): TextNode {
  const t = figma.createText();
  t.fontName = o.font;
  t.characters = contenido;
  t.fontSize = o.size;
  t.fills = [solido(o.color ?? C.tinta)];
  if (o.tracking) t.letterSpacing = { value: o.tracking, unit: "PERCENT" };
  if (o.lineHeight) t.lineHeight = { value: o.lineHeight, unit: "PERCENT" };
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.width) {
    t.textAutoResize = "HEIGHT";
    t.resize(o.width, t.height);
  } else {
    t.textAutoResize = "WIDTH_AND_HEIGHT";
  }
  t.x = o.x;
  t.y = o.y;
  t.name = o.nombre ?? contenido.slice(0, 32);
  padre.appendChild(t);
  return t;
}

function rect(padre: FrameNode, x: number, y: number, w: number, h: number, fills: Paint[], nombre: string, radio = 0) {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.x = x;
  r.y = y;
  r.fills = fills;
  r.cornerRadius = radio;
  r.name = nombre;
  padre.appendChild(r);
  return r;
}

/** Números de altura completa: Cormorant usa números de estilo antiguo por defecto */
function numerosAltos(t: TextNode) {
  try {
    (t as any).setRangeOpenTypeFeatures(0, t.characters.length, { LNUM: true });
  } catch {
    /* versiones de Figma sin soporte: queda con el número de estilo antiguo */
  }
}

// ── fondo ────────────────────────────────────────────────────────────────────

let fondoFill: Paint;
try {
  const imagen = await figma.createImageAsync(FOTO_URL);
  fondoFill = { type: "IMAGE", imageHash: imagen.hash, scaleMode: "FILL" };
} catch (e) {
  print("No se pudo descargar la foto (" + FOTO_URL + "). Queda un fondo marfil: reemplazá el fill de las capas «Fondo» por la imagen.");
  fondoFill = solido(C.marfil);
}

function crearSlide(i: number): FrameNode {
  const f = figma.createFrame();
  f.name = `Garantía · ${i + 1}/${SLIDES}`;
  f.resize(W, H);
  f.x = figma.viewport.center.x - (W * SLIDES + GAP * (SLIDES - 1)) / 2 + i * (W + GAP);
  f.y = figma.viewport.center.y - H / 2;
  f.fills = [solido(C.marfil)];
  f.clipsContent = true;

  // La misma imagen en los 3 frames, corrida un ancho de slide cada vez.
  rect(f, -W * i, FONDO_Y, FONDO_W, FONDO_H, [fondoFill], "Fondo (tercio " + (i + 1) + ")");

  // Numeración discreta arriba a la derecha
  texto(f, `0${i + 1} / 0${SLIDES}`, {
    x: W - 88 - 140,
    y: 84,
    width: 140,
    size: 24,
    font: SANS,
    color: C.tintaSuave,
    tracking: 12,
    align: "RIGHT",
    nombre: "Paginación",
  });
  return f;
}

// ── slide 1 · portada ────────────────────────────────────────────────────────

const s1 = crearSlide(0);
rect(s1, 0, 0, W, H, [velo("izquierda", 0.9)], "Velo marfil");

texto(s1, "GARANTÍA ABRAXAS", { x: 88, y: 84, size: 24, font: SANS_MEDIUM, color: C.coral, tracking: 22 });

const dos = texto(s1, "2", { x: 70, y: 250, size: 460, font: SERIF_LIGHT, color: C.coral, lineHeight: 80, nombre: "2" });
numerosAltos(dos);

texto(s1, "años de garantía\nen cada pieza.", {
  x: 88,
  y: 680,
  width: 760,
  size: 104,
  font: SERIF,
  lineHeight: 98,
  nombre: "Titular",
});

texto(s1, "Joyería artesanal hecha para durar.", {
  x: 88,
  y: 940,
  width: 640,
  size: 32,
  font: SANS,
  color: C.tintaSuave,
  lineHeight: 140,
});

rect(s1, 88, 1214, 64, 2, [solido(C.tinta)], "Línea");
texto(s1, "Deslizá", { x: 172, y: 1196, size: 28, font: SANS_MEDIUM, tracking: 10 });

// ── slide 2 · la promesa (el colgante queda al centro) ───────────────────────

const s2 = crearSlide(1);
rect(s2, 0, 0, W, H, [velo("abajo", 0.55)], "Velo inferior");

const tarjeta = rect(s2, 88, 930, W - 176, 332, [solido(C.blanco, 0.9)], "Tarjeta", 32);
tarjeta.effects = [
  {
    type: "DROP_SHADOW",
    color: { r: 0.17, g: 0.13, b: 0.12, a: 0.08 },
    offset: { x: 0, y: 12 },
    radius: 40,
    spread: 0,
    visible: true,
    blendMode: "NORMAL",
  },
];
texto(s2, "Si aparece un defecto de fabricación,", {
  x: 148,
  y: 986,
  width: W - 296,
  size: 56,
  font: SERIF,
  lineHeight: 105,
});
texto(s2, "la reparamos o la reemplazamos.", {
  x: 148,
  y: 1104,
  width: W - 296,
  size: 56,
  font: SERIF_ITALIC,
  color: C.coral,
  lineHeight: 105,
});

// ── slide 3 · qué cubre + cierre ─────────────────────────────────────────────

const s3 = crearSlide(2);
rect(s3, 0, 0, W, H, [velo("derecha", 0.92)], "Velo marfil");

texto(s3, "QUÉ CUBRE", { x: 88, y: 84, size: 24, font: SANS_MEDIUM, color: C.coral, tracking: 22 });
texto(s3, "Cada detalle,\nrespaldado.", { x: 88, y: 200, width: 820, size: 104, font: SERIF, lineHeight: 98 });

const cubre = ["Engaste y piedras", "Broches y mecanismos", "Metal y soldaduras"];
cubre.forEach((item, k) => {
  const y = 520 + k * 132;
  rect(s3, 88, y, 620, 104, [solido(C.blanco, 0.85)], "Ítem " + (k + 1), 52).strokes = [solido(C.linea)];
  const punto = figma.createEllipse();
  punto.resize(14, 14);
  punto.x = 132;
  punto.y = y + 45;
  punto.fills = [solido(C.coral)];
  punto.name = "Punto";
  s3.appendChild(punto);
  texto(s3, item, { x: 172, y: y + 32, size: 34, font: SANS, nombre: item });
});

texto(s3, "Defectos de fabricación · 2 años desde la compra", {
  x: 88,
  y: 940,
  width: 640,
  size: 26,
  font: SANS,
  color: C.tintaSuave,
  lineHeight: 140,
});

const cta = rect(s3, 88, 1150, 560, 104, [solido(C.coral)], "Botón", 52);
texto(s3, "joyasabraxas.com/garantia", {
  x: cta.x,
  y: cta.y + 34,
  width: cta.width,
  size: 30,
  font: SANS_MEDIUM,
  color: C.blanco,
  align: "CENTER",
  nombre: "Botón · texto",
});

// ── final ────────────────────────────────────────────────────────────────────

const slides = [s1, s2, s3];
for (const s of slides) figma.currentPage.appendChild(s);
figma.currentPage.selection = slides;
figma.viewport.scrollAndZoomIntoView(slides);
print("Listo: carrusel de garantía (3 × 1080×1350). Exportá cada frame como PNG o JPG al 100 %.");
