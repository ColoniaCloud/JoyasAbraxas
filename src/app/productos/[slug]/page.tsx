import { fetchProductBySlug, fetchProductReviews, fetchAttributeTerms, fetchProductVariations, fetchProducts, WpApiError } from "@/lib/wp";
import { sanitize } from "@/lib/sanitize";
import { formatPrice } from "@/lib/utils";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import { summarizeReviews, toReview, type Review } from "@/lib/reviews";
import type { Metadata } from "next";
import type { WCAttributeTerm, WPVariation, WPProduct } from "@/lib/types";
import Link from "next/link";
import Breadcrumbs from "@/components/breadcrumbs";
import ProductGallery from "@/components/product-gallery";
import ProductPurchasePanel from "@/components/product-purchase-panel";
import ProductCard from "@/components/product-card";
import ReviewsSection from "@/components/reviews/reviews-section";
import StarRating from "@/components/reviews/star-rating";

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
      alternates: { canonical: `/productos/${slug}` },
      openGraph: {
        type: "website",
        title: product.name,
        description,
        url: `/productos/${slug}`,
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
  let reviews: Review[] = [];
  let error = "";

  try {
    product = await fetchProductBySlug(slug);
    reviews = (await fetchProductReviews(product.id)).map(toReview);
  } catch (e) {
    // No renderizar el fallo: Next cachearía esta pantalla de error como render válido.
    if (e instanceof WpApiError) throw e;
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
  const reviewSummary = summarizeReviews(reviews);

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

  // Productos relacionados (cross-sell): misma categoría, excluyendo el actual
  let related: WPProduct[] = [];
  if (product.categories.length > 0) {
    try {
      const res = await fetchProducts({ perPage: 8, category: product.categories[0].id });
      related = res.data.filter((p) => p.id !== product!.id).slice(0, 4);
    } catch {
      // sin relacionados si falla la API
    }
  }

  return (
    <main className="mx-auto max-w-[1080px] px-4 pt-8 pb-28 lg:pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, reviews)) }}
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

          {reviewSummary.count > 0 && (
            <a
              href="#resenas"
              className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              <StarRating value={reviewSummary.average} size={16} />
              <span>
                {reviewSummary.average.toFixed(1).replace(".", ",")} · {reviewSummary.count}{" "}
                {reviewSummary.count === 1 ? "reseña" : "reseñas"}
              </span>
            </a>
          )}

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
                ? `${isVariable ? "Desde " : ""}${formatPrice(product.price)}`
                : "Sin precio"}
            </span>
            {hasDiscount && (
              <span className="text-base text-[var(--color-muted)] line-through">
                {formatPrice(product.regular_price)}
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

      {/* Reseñas */}
      <ReviewsSection productId={product.id} productName={product.name} reviews={reviews} />


      {/* Productos relacionados */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
