import type { Metadata } from "next";
import { fetchProducts, fetchCategories } from "@/lib/wp";
import type { WPProduct, WPCategory } from "@/lib/types";
import HeroSlider, { type HeroSlide } from "@/components/hero-slider";
import CategorySection from "@/components/category-section";

export const metadata: Metadata = {
  title: "Abraxas Joyería | Joyería artesanal de alta calidad en Uruguay",
  description:
    "Joyería artesanal de alta calidad en Uruguay: anillos, colgantes y caravanas únicos. Descubrí nuestras colecciones exclusivas.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Abraxas Joyería | Joyería artesanal de alta calidad",
    description:
      "Anillos, colgantes y caravanas artesanales. Descubrí nuestras colecciones exclusivas.",
    url: "/",
  },
};

// Map de slugs de categoría → imagen local + copy persuasivo
const SLIDE_DATA: Record<string, { image: string; tagline: string; buttonLabel: string }> = {
  anillos: {
    image: "/ornament/slider/anillos2.jpg",
    tagline: "Cada anillo lleva consigo una promesa. Descubre piezas únicas que celebran los momentos más importantes de tu vida.",
    buttonLabel: "Ver Anillos",
  },
  caravanas: {
    image: "/ornament/slider/caravanas.jpg",
    tagline: "Pequeñas joyas, gran impacto. Caravanas que transforman cualquier look en una declaración de elegancia.",
    buttonLabel: "Ver Caravanas",
  },
  colgantes: {
    image: "/ornament/slider/colgantes2.jpg",
    tagline: "Lleva cerca lo que más valoras. Colgantes artesanales que expresan tu esencia con cada movimiento.",
    buttonLabel: "Ver Colgantes",
  },
};

const SLIDE_ORDER = ["anillos", "caravanas", "colgantes"];

function buildSlides(categories: WPCategory[]): HeroSlide[] {
  return SLIDE_ORDER.flatMap((slug) => {
    const data = SLIDE_DATA[slug];
    if (!data) return [];
    const cat = categories.find(
      (c) => c.slug === slug || c.name.toLowerCase() === slug
    );
    return [
      {
        image: data.image,
        title: cat?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1),
        tagline: data.tagline,
        href: cat ? `/categorias/${cat.slug}` : "/categorias",
        buttonLabel: data.buttonLabel,
      },
    ];
  });
}

export default async function HomePage() {
  let categories: WPCategory[] = [];

  try {
    categories = await fetchCategories({ perPage: 100 });
    categories = categories.filter(
      (c) => c.parent === 0 && c.slug !== "uncategorized" && c.count > 0
    );
  } catch {
    // API no disponible — slides usan href de fallback
  }

  const slides = buildSlides(categories);

  // Fetch products for each category in parallel
  const categoryProducts = await Promise.all(
    categories.map((cat) =>
      fetchProducts({ perPage: 12, category: cat.id }).then(r => r.data).catch(() => [] as WPProduct[])
    )
  );

  return (
    <main className="-mt-36">
      <h1 className="sr-only">
        Abraxas Joyería — joyería artesanal de alta calidad en Uruguay
      </h1>
      <HeroSlider slides={slides} />

      {categories.map((cat, i) => {
        const products = categoryProducts[i] ?? [];
        if (!products.length) return null;
        return (
          <CategorySection key={cat.id} cat={cat} products={products} index={i} />
        );
      })}
    </main>
  );
}
