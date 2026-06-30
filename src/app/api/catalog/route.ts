import { fetchProducts } from "@/lib/wp";
import type { WPProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.joyasabraxas.com";

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanDescription(html: string): string {
  if (!html) return "";
  // Elimina todas las etiquetas HTML
  const text = html.replace(/<[^>]+>/g, "").trim();
  // Corta a un máximo razonable y escapa
  return escapeXml(text.slice(0, 1000));
}

export async function GET() {
  let products: WPProduct[] = [];
  try {
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const result = await fetchProducts({ perPage: 100, page });
      products.push(...result.data);
      if (page >= result.totalPages) {
        hasMore = false;
      } else {
        page++;
      }
    }
  } catch (error) {
    console.error("[catalog-feed] Error al obtener productos para el catálogo XML:", error);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Abraxas Joyería</title>
    <link>${SITE_URL}</link>
    <description>Joyería artesanal de alta calidad en Uruguay</description>
`;

  for (const p of products) {
    const title = escapeXml(p.name);
    const description = cleanDescription(p.short_description || p.description || `${p.name} - Joyería artesanal Abraxas`);
    const link = `${SITE_URL}/productos/${p.slug}`;
    const imageLink = p.images[0]?.src ? escapeXml(p.images[0].src) : "";
    const availability = p.stock_status === "instock" ? "in_stock" : "out_of_stock";
    const priceStr = `${p.price || "0"} UYU`;

    xml += `    <item>
      <g:id>${p.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${priceStr}</g:price>
      <g:brand>Abraxas</g:brand>
      <g:condition>new</g:condition>
    </item>
`;
  }

  xml += `  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
