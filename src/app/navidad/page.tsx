import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { fetchProductsByIds, WpApiError } from "@/lib/wp";
import type { WPProduct } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { estrellaSueltaSvg } from "@/lib/guirnalda-joyero";
import NavidadEscena from "@/components/navidad-escena";

export const metadata: Metadata = {
  title: "Productos destacados de Fiestas | Abraxas Joyería",
  description:
    "Diez piezas de plata elegidas para regalar estas Fiestas: colgantes, anillos, caravanas y brazaletes artesanales.",
  alternates: { canonical: "/navidad" },
  openGraph: {
    title: "Productos destacados de Fiestas | Abraxas Joyería",
    description: "Diez piezas de plata elegidas para regalar estas Fiestas.",
    url: "/navidad",
  },
};

/**
 * Selección curada. Las dos primeras de cada mitad van grandes (2×2) en la grilla.
 * Para cambiar la selección alcanza con editar esta lista de ids de WooCommerce.
 */
const SELECCION: { id: number; destacado?: boolean }[] = [
  { id: 28166, destacado: true }, // Colgante «Mi Estrella»
  { id: 28543 }, // Anillo Ale con amatista talla brillante
  { id: 440 }, // Caravanas mini de granate
  { id: 408 }, // Colgante Jaspe Rojo XL
  { id: 28318 }, // Anillo Möbius con circonia
  { id: 146 }, // Brazalete Mei con zafiros negros
  { id: 28611 }, // Caravanas zafiros negros 3mm
  { id: 341, destacado: true }, // Colgante Luna Estrellada
  { id: 835 }, // Corazón de Madre
  { id: 653 }, // Anillo Luz
];

const ESTRELLA = estrellaSueltaSvg("dest-estrella").replace('width="80" height="80"', 'width="100%" height="100%"');

function Pieza({ product, destacado }: { product: WPProduct; destacado?: boolean }) {
  const imagen = product.images[0];
  const enOferta = product.sale_price && product.regular_price && product.sale_price !== product.regular_price;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-[#dcc08a]/15 bg-[#12301f] transition-colors duration-300 hover:border-[#dcc08a]/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc08a]",
        destacado && "col-span-2 md:row-span-2"
      )}
    >
      <div className={cn("relative w-full overflow-hidden bg-[#1c1a18]", destacado ? "aspect-square md:aspect-auto md:flex-1" : "aspect-square")}>
        {imagen && (
          <Image
            src={imagen.src}
            alt={imagen.alt || product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes={destacado ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
          />
        )}
        {destacado && (
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 size-11 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
            dangerouslySetInnerHTML={{ __html: ESTRELLA }}
          />
        )}
      </div>
      <div className={cn("flex flex-col gap-1.5", destacado ? "p-5 md:p-6" : "p-4")}>
        <p
          className={cn(
            "m-0 text-[var(--color-ink)]",
            destacado
              ? "font-[family-name:var(--font-heading)] text-2xl leading-tight md:text-[1.75rem]"
              : "line-clamp-2 text-sm font-medium"
          )}
        >
          {product.name}
        </p>
        <p className="m-0 flex items-baseline gap-2">
          <span className={cn("font-semibold text-[var(--color-brand-strong)]", destacado ? "text-lg" : "text-base")}>
            {product.type === "variable" && "Desde "}
            {formatPrice(enOferta ? product.sale_price : product.price)}
          </span>
          {enOferta && (
            <span className="text-sm text-[var(--color-ink)]/50 line-through">{formatPrice(product.regular_price)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}

export default async function DestacadosPage() {
  let productos: WPProduct[] = [];
  try {
    productos = await fetchProductsByIds(SELECCION.map((s) => s.id));
  } catch (e) {
    // No cachear una página vacía si la API está caída
    if (e instanceof WpApiError) throw e;
  }
  const destacado = new Set(SELECCION.filter((s) => s.destacado).map((s) => s.id));

  return (
    <main>
      <NavidadEscena>
      <div className="mx-auto max-w-[1200px] px-5 pb-20 md:px-6">
      {/* Hero alto: deja aire bajo la guirnalda para que las estrellas colgantes no tapen el título */}
      <header className="mx-auto flex min-h-[54svh] max-w-[640px] flex-col items-center justify-end pb-14 pt-40 text-center md:min-h-[62svh] md:pb-20 md:pt-48">
        <h1 className="m-0 font-[family-name:var(--font-heading)] text-[clamp(2.5rem,6vw,4.25rem)] font-light leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]">
          Productos destacados
        </h1>
        <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-relaxed text-[var(--color-ink)]/75 md:text-base">
          Diez piezas de plata que elegimos para regalar estas Fiestas: colgantes, anillos, caravanas y un brazalete.
        </p>
      </header>

      {productos.length === 0 ? (
        <p className="text-center text-[var(--color-ink)]/75">
          No pudimos cargar la selección.{" "}
          <Link href="/categorias" className="text-[#dcc08a]! underline underline-offset-4">
            Ver todas las categorías
          </Link>
        </p>
      ) : (
        <section
          aria-label="Selección de Fiestas"
          className="grid grid-flow-dense grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
        >
          {productos.map((p) => (
            <Pieza key={p.id} product={p} destacado={destacado.has(p.id)} />
          ))}
        </section>
      )}

      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <p className="m-0 font-[family-name:var(--font-heading)] text-2xl text-[var(--color-ink)]">
          ¿Buscás otra pieza?
        </p>
        <Link
          href="/categorias"
          className="inline-flex min-h-11 items-center justify-center border border-[#dcc08a]/60 px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#dcc08a]! transition-colors hover:border-[#dcc08a] hover:bg-[#dcc08a] hover:text-[#1a1208]! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcc08a]"
        >
          Ver todas las categorías
        </Link>
      </div>
      </div>
      </NavidadEscena>
    </main>
  );
}
