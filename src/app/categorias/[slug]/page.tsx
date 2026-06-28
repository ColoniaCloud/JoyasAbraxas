import { fetchCategoryBySlug, fetchProducts } from "@/lib/wp";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import Breadcrumbs from "@/components/breadcrumbs";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await fetchCategoryBySlug(slug);
    const cleanDesc = category.description?.replace(/<[^>]+>/g, "").trim();
    const description =
      cleanDesc?.slice(0, 160) ||
      `${category.name}: joyería artesanal Abraxas. Descubrí nuestra colección de ${category.name.toLowerCase()}.`;
    return {
      title: `${category.name} | Abraxas Joyería`,
      description,
      alternates: { canonical: `/categorias/${slug}` },
      openGraph: {
        title: `${category.name} | Abraxas Joyería`,
        description,
        url: `/categorias/${slug}`,
        images: category.image?.src ? [{ url: category.image.src }] : [],
      },
    };
  } catch {
    return { title: "Categoría | Abraxas" };
  }
}

export default async function CategoriaDetailPage({ params }: Props) {
  const { slug } = await params;
  let category;
  let products;
  let error = "";

  try {
    category = await fetchCategoryBySlug(slug);
    const result = await fetchProducts({ perPage: 50, category: category.id });
    products = result.data;
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudo cargar la categoría";
  }

  if (error || !category) {
    return (
      <main className="mx-auto max-w-[1080px] px-4 py-8">
        <Link href="/categorias" className="font-semibold text-[var(--color-brand-strong)]">
          Volver a categorías
        </Link>
        <p className="my-4 rounded-lg border border-red-900/40 bg-red-950/40 p-3">
          {error || "Categoría no encontrada"}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1080px] px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Inicio", href: "/" },
              { name: "Categorías", href: "/categorias" },
              { name: category.name, href: `/categorias/${category.slug}` },
            ])
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Categorías", href: "/categorias" },
          { label: category.name },
        ]}
      />

      <h1 className="mb-1">{category.name}</h1>
      {category.description && (
        <p className="mb-6 text-[var(--color-muted)]">{category.description}</p>
      )}

      {products && products.length === 0 && (
        <p className="text-[var(--color-muted)]">No hay productos en esta categoría.</p>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
}
