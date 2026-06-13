import type { Metadata } from "next";
import "./globals.css";
import { Geist, Cormorant_Garamond } from "next/font/google";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Analytics from "@/components/analytics";
import { fetchCategories } from "@/lib/wp";
import type { WPCategory } from "@/lib/types";
import { organizationJsonLd } from "@/lib/structured-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.joyasabraxas.com";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const cormorant = Cormorant_Garamond({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-heading'});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Abraxas | Joyería de Alta Calidad",
  description: "Joyería artesanal de alta calidad. Descubre nuestras colecciones exclusivas.",
  icons: {
    icon: "https://api.joyasabraxas.com/wp-content/uploads/2023/09/cropped-logo_n.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: WPCategory[] = [];
  try {
    const all = await fetchCategories({ perPage: 100 });
    categories = all.filter((c) => c.parent === 0 && c.slug !== "uncategorized" && c.count > 0);
  } catch {
    // API not available
  }

  return (
    <html lang="es" className={cn("font-sans", geist.variable, cormorant.variable)}>
      <body>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <CartProvider>
          <Header categories={categories} />
          <div className="pt-24">
            {children}
          </div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
