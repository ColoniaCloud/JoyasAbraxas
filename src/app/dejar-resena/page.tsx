import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs";
import ProductReviewPicker, { type ReviewableProduct } from "@/components/reviews/product-review-picker";
import { fetchProducts, WpApiError } from "@/lib/wp";

export const metadata: Metadata = {
  title: "Dejar una reseña | Abraxas Joyería",
  description: "Contanos cómo fue tu experiencia con tu joya de Abraxas y ayudá a otras personas a elegir la suya.",
  alternates: { canonical: "/dejar-resena" },
  // Página de servicio: no aporta nada en buscadores.
  robots: { index: false, follow: true },
};

interface Props {
  searchParams: Promise<{ producto?: string }>;
}

async function loadProducts(): Promise<ReviewableProduct[]> {
  const all: ReviewableProduct[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await fetchProducts({ perPage: 100, page });
    totalPages = res.totalPages;
    for (const p of res.data) {
      all.push({ id: p.id, name: p.name, slug: p.slug, image: p.images[0]?.src ?? null });
    }
    page++;
  } while (page <= totalPages);
  return all.sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export default async function DejarResenaPage({ searchParams }: Props) {
  const { producto } = await searchParams;

  let products: ReviewableProduct[] = [];
  try {
    products = await loadProducts();
  } catch (e) {
    // Se relanza para que Next no cachee una pantalla vacía mientras la API está caída.
    if (e instanceof WpApiError) throw e;
  }

  return (
    <main className="mx-auto max-w-[720px] px-4 pt-8 pb-16">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Dejar una reseña" }]} />

      <h1 className="mt-0 mb-2 text-2xl">Dejá tu reseña</h1>
      <p className="mb-8 text-[var(--color-muted)]">
        Tu opinión nos ayuda a mejorar y a que otras personas elijan su joya con confianza. Elegí el producto y
        contanos cómo fue tu experiencia. Revisamos cada reseña antes de publicarla.
      </p>

      <ProductReviewPicker products={products} initialSlug={producto} />
    </main>
  );
}
