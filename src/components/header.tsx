"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import type { WPCategory } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/sale", label: "Sale" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];

interface HeaderProps {
  categories?: WPCategory[];
}

export default function Header({ categories = [] }: HeaderProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openMega() {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  }
  function closeMega() {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 120);
  }

  return (
    <header className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[1200px] -translate-x-1/2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/80 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {/* Main nav */}
      <nav className="flex items-center justify-between px-5 py-3.5">
        {/* Left: logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="https://api.joyasabraxas.com/wp-content/uploads/2024/06/logo-blanco.png"
            alt="Abraxas Joyería"
            width={130}
            height={40}
            className="hidden h-8 w-auto lg:block"
            priority
          />
          <Image
            src="https://api.joyasabraxas.com/wp-content/uploads/2024/06/logo-blanco.png"
            alt="Abraxas"
            width={90}
            height={28}
            className="block h-7 w-auto lg:hidden"
            priority
          />
        </Link>

        {/* Right: nav + icons */}
        <div className="flex items-center gap-1">
          {/* Nav links (desktop only) */}
          <ul className="mr-3 hidden list-none items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-[12px] font-medium uppercase tracking-[0.12em] transition-colors hover:text-[var(--color-brand)]",
                    pathname === link.href ? "text-[var(--color-brand)]" : "text-[var(--color-ink)]"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Categorías with mega menu */}
            {categories.length > 0 && (
              <li
                className="relative"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <button
                  className={cn(
                    "flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors hover:text-[var(--color-brand)]",
                    megaOpen || pathname.startsWith("/categorias")
                      ? "text-[var(--color-brand)]"
                      : "text-[var(--color-ink)]"
                  )}
                >
                  Categorías
                  <ChevronDown
                    size={13}
                    className={cn("transition-transform duration-200", megaOpen && "rotate-180")}
                  />
                </button>

                {/* Mega menu panel */}
                <div
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                  className={cn(
                    "absolute right-0 top-[calc(100%+14px)] w-[520px] origin-top overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/95 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-200",
                    megaOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                  )}
                >
                  <div className="p-4">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Explorar categorías
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/categorias/${cat.slug}`}
                          onClick={() => setMegaOpen(false)}
                          className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all hover:border-[var(--color-brand)]/40 hover:shadow-md"
                        >
                          <div className="relative h-[80px] w-full overflow-hidden bg-[#1c1a18]">
                            {cat.image ? (
                              <Image
                                src={cat.image.src}
                                alt={cat.image.alt || cat.name}
                                fill
                                sizes="160px"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-2xl text-[var(--color-muted)]">
                                {cat.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="px-2.5 py-2">
                            <p className="m-0 truncate text-[12px] font-medium text-[var(--color-ink)] group-hover:text-[var(--color-brand)]">
                              {cat.name}
                            </p>
                            <p className="m-0 text-[10px] text-[var(--color-muted)]">
                              {cat.count} {cat.count === 1 ? "producto" : "productos"}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/categorias"
                      onClick={() => setMegaOpen(false)}
                      className="mt-3 flex w-full items-center justify-center rounded-xl border border-[var(--color-line)] py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--color-muted)] transition-colors hover:border-[var(--color-brand)]/40 hover:text-[var(--color-brand)]"
                    >
                      Ver todas las categorías →
                    </Link>
                  </div>
                </div>
              </li>
            )}
          </ul>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="cursor-pointer rounded-lg border-0 bg-transparent p-1.5 text-[var(--color-ink)] transition-colors hover:text-[var(--color-brand)] lg:hidden"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* User */}
          <Link
            href="/mi-cuenta"
            className="rounded-lg p-1.5 text-[var(--color-ink)] transition-colors hover:text-[var(--color-brand)]"
            aria-label="Mi cuenta"
          >
            <User size={20} strokeWidth={1.5} />
          </Link>

          {/* Cart */}
          <Link
            href="/carrito"
            className="relative rounded-lg p-1.5 text-[var(--color-ink)] transition-colors hover:text-[var(--color-brand)]"
            aria-label="Carrito"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 flex size-[15px] items-center justify-center rounded-full bg-[var(--color-brand)] text-[9px] font-bold text-[var(--color-panel)]">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        className={cn(
          "overflow-hidden border-t border-[var(--color-line)] transition-all duration-300 lg:hidden",
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex list-none flex-col gap-1 px-5 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-[13px] font-medium uppercase tracking-[0.12em] transition-colors",
                  pathname === link.href
                    ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                    : "text-[var(--color-ink)] hover:bg-[var(--color-line)]/50"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Categorías accordion (mobile) */}
          {categories.length > 0 && (
            <li>
              <button
                onClick={() => setMobileCatsOpen(!mobileCatsOpen)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-lg border-0 bg-transparent px-3 py-2.5 text-[13px] font-medium uppercase tracking-[0.12em] transition-colors",
                  mobileCatsOpen || pathname.startsWith("/categorias")
                    ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                    : "text-[var(--color-ink)] hover:bg-[var(--color-line)]/50"
                )}
              >
                Categorías
                <ChevronDown
                  size={14}
                  className={cn("transition-transform duration-200", mobileCatsOpen && "rotate-180")}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  mobileCatsOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <ul className="mt-1 flex list-none flex-col gap-0.5 pl-3">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/categorias/${cat.slug}`}
                        onClick={() => { setMobileOpen(false); setMobileCatsOpen(false); }}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-line)]/50 hover:text-[var(--color-brand)]"
                      >
                        {cat.name}
                        <span className="text-[10px] text-[var(--color-muted)]">{cat.count}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/categorias"
                      onClick={() => { setMobileOpen(false); setMobileCatsOpen(false); }}
                      className="block rounded-lg px-3 py-2 text-[12px] font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-line)]/50"
                    >
                      Ver todas →
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
