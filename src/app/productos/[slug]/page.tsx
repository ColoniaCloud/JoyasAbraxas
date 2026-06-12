import { fetchProductBySlug, fetchProductReviews, fetchAttributeTerms, fetchProductVariations } from "@/lib/wp";
import { sanitize } from "@/lib/sanitize";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import type { Metadata } from "next";
import type { WCAttributeTerm, WPVariation } from "@/lib/types";
import Link from "next/link";
import Breadcrumbs from "@/components/breadcrumbs";
import ProductGallery from "@/components/product-gallery";
import ProductPurchasePanel from "@/components/product-purchase-panel";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await fetchProductBySlug(slug);
    const description = product.short_description
      ?.replace(/<[^>]+>/g, "")
      .slice(0, 160) || `${product.name} — Joyería artesanal Abraxas`;
    return {
      title: `${product.name} | Abraxas Joyería`,
      description,
      openGraph: {
        title: product.name,
        description,
        images: product.images[0]?.src ? [{ url: product.images[0].src }] : [],
      },
    };
  } catch {
    return { title: "Producto | Abraxas" };
  }
}

export default async function ProductoDetailPage({ params }: Props) {
  const { slug } = await params;
  let product;
  let reviews;
  let error = "";

  try {
    product = await fetchProductBySlug(slug);
    reviews = await fetchProductReviews(product.id);
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudo cargar el producto";
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-[1080px] px-4 py-8">
        <Link href="/productos" className="font-semibold text-[var(--color-brand-strong)]">
          Volver al catálogo
        </Link>
        <p className="my-4 rounded-lg border border-red-900/40 bg-red-950/40 p-3">
          {error || "Producto no encontrado"}
        </p>
      </main>
    );
  }

  const isVariable = product.type === "variable";

  // Atributos de variación (los que el cliente elige) vs. atributos descriptivos
  const variationAttrs = product.attributes.filter((a) => a.variation);
  const infoAttrs = product.attributes.filter(
    (a) => !a.variation && a.options.some(Boolean),
  );

  let variations: WPVariation[] = [];
  let colorTerms: WCAttributeTerm[] = [];
  let acabadoTerms: WCAttributeTerm[] = [];

  if (isVariable && product.variations.length > 0) {
    const colorAttr = variationAttrs.find((a) => a.slug === "pa_colores");
    const acabadoAttr = variationAttrs.find((a) => a.slug === "pa_acabado");
    try {
      [variations, colorTerms, acabadoTerms] = await Promise.all([
        fetchProductVariations(product.id),
        colorAttr ? fetchAttributeTerms(colorAttr.id) : Promise.resolve([]),
        acabadoAttr ? fetchAttributeTerms(acabadoAttr.id) : Promise.resolve([]),
      ]);
    } catch (e) {
      console.error("[product-page] fetch variations/terms failed:", e);
      // El selector seguirá funcionando con fallbacks; sin variaciones queda deshabilitado.
    }
  }

  const hasDiscount = product.sale_price && product.regular_price && product.sale_price !== product.regular_price;

  return (
    <main className="mx-auto max-w-[1080px] px-4 pt-8 pb-28 lg:pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Inicio", href: "/" },
              { name: "Catálogo", href: "/productos" },
              { name: product.name, href: `/productos/${product.slug}` },
            ])
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Catálogo", href: "/productos" },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Info */}
        <div>
          <h1 className="mt-0 mb-2 text-2xl">{product.name}</h1>

          {product.categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {product.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categorias/${cat.slug}`}
                  className="rounded-full bg-[var(--color-line)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-muted)]"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {product.price
                ? `${isVariable ? "Desde " : ""}$${product.price}`
                : "Sin precio"}
            </span>
            {hasDiscount && (
              <span className="text-base text-[var(--color-muted)] line-through">
                ${product.regular_price}
              </span>
            )}
          </div>

          {product.stock_status === "instock" ? (
            <p className="mb-4 text-sm font-medium text-green-700">En stock</p>
          ) : (
            <p className="mb-4 text-sm font-medium text-red-600">Agotado</p>
          )}

          {product.short_description && (
            <div
              className="mb-4 text-[var(--color-muted)] [&_p]:m-0"
              dangerouslySetInnerHTML={{ __html: sanitize(product.short_description) }}
            />
          )}

          <ProductPurchasePanel
            product={product}
            variations={variations}
            colorTerms={colorTerms}
            acabadoTerms={acabadoTerms}
          />

          {product.sku && (
            <p className="mt-4 text-sm text-[var(--color-muted)]">SKU: {product.sku}</p>
          )}

          {infoAttrs.length > 0 && (
            <div className="mt-4 space-y-2">
              {infoAttrs.map((attr) => (
                <div key={attr.id} className="text-sm">
                  <span className="font-semibold">{attr.name}:</span>{" "}
                  {attr.options.filter(Boolean).join(", ")}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <section className="mt-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <h2 className="mt-0 mb-4">Descripción</h2>
          <div
            className="prose max-w-none text-[var(--color-muted)] [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: sanitize(product.description) }}
          />
        </section>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4">
            Reseñas ({reviews.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-panel)] p-4"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold">{review.reviewer}</span>
                  <span className="text-sm text-[var(--color-muted)]">
                    {"★".repeat(Math.max(0, Math.min(5, review.rating)))}{"☆".repeat(Math.max(0, 5 - Math.max(0, Math.min(5, review.rating))))}
                  </span>
                </div>
                <div
                  className="text-sm text-[var(--color-muted)] [&_p]:m-0"
                  dangerouslySetInnerHTML={{ __html: review.review }}
                />
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
