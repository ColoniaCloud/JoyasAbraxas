# Pendientes — Joyería Abraxas

Tareas priorizadas para llevar el proyecto a producción. Organizado por prioridad.

---

## P0 — Bloquean producción

- [x] **Arreglar credenciales WooCommerce expuestas** — Eliminar fallback a `NEXT_PUBLIC_WC_*` en `wp.ts`. Verificar `.env`. ([Bug #1](bugs-errores.md))
- [x] **Restringir dominios de imágenes** en `next.config.ts` — Solo permitir `api.joyasabraxas.com`. ([Bug #2](bugs-errores.md))
- [x] **Integrar sistema de pagos con MercadoPago** — Checkout funcional que cree pedidos en WooCommerce y redirija a MercadoPago. ([Plan detallado](sistema-de-pagos.md))
- [x] **Sanitizar HTML de WordPress** — Agregar `sanitize-html` o `isomorphic-dompurify` para todo `dangerouslySetInnerHTML`. ([Bug #3](bugs-errores.md))
- [x] **Arreglar link roto en carrito** — Cambiar `item.product.id` a `item.product.slug`. ([Bug #4](bugs-errores.md))
- [x] **Corregir datos de contacto** — Poner Montevideo, Uruguay y WhatsApp real. ([Bug #7](bugs-errores.md))

---

## P1 — Necesarios para buena experiencia

- [x] **Agregar caché y revalidación a todos los fetches** — ISR con `next: { revalidate }` y tags por tipo de recurso. ([Bug #8](bugs-errores.md))
- [x] **Migrar categorías de `[id]` a `[slug]`** — URLs SEO-friendly (`/categorias/anillos`). Crear `fetchCategoryBySlug()`. ([Bug #9](bugs-errores.md))
- [x] **Crear componente Footer** — Info de contacto, WhatsApp, redes sociales, enlaces legales, copyright.
- [x] **Crear componente ProductCard reutilizable** — Extraer de las 4+ implementaciones duplicadas. ([Bug #16](bugs-errores.md))
- [x] **Corregir ortografía** — Todas las tildes faltantes en la interfaz. ([Bug #12](bugs-errores.md))
- [x] **Optimizar página Sale** — Usar `on_sale=true` en la API en vez de filtrar en frontend. ([Bug #10](bugs-errores.md))
- [x] **Mejorar metadata SEO** — Agregar `description`, Open Graph e imagen a todas las páginas. ([Bug #11](bugs-errores.md))
- [x] **Implementar formulario de contacto funcional** — Envío real por email o API. ([Bug #6](bugs-errores.md))
- [x] **Crear página 404 personalizada** — `src/app/not-found.tsx` con diseño alineado a la marca.
- [x] **Agregar `loading.tsx`** — Estados de carga con skeleton loaders en rutas principales.

---

## P2 — Mejoran calidad y profesionalismo

- [ ] **Refactorizar `wp.ts` en servicios separados** — Dividir en `lib/services/products.ts`, `categories.ts`, `content.ts`, `auth.ts`.
- [ ] **Separar tipos en archivos individuales** — Mover de un solo `types.ts` a `lib/types/product.ts`, `category.ts`, `cart.ts`, `wp.ts`.
- [x] **Crear Route Handler para login** — Mover auth a `/api/auth/login` en vez de llamar directo al endpoint de WP. ([Bug #17](bugs-errores.md))
- [x] **Agregar `error.tsx`** — Error boundaries personalizados en rutas principales.
- [x] **Mejorar galería de producto** — Lightbox, zoom, selección de imagen principal, transiciones suaves.
- [x] **Agregar breadcrumbs** — Navegación contextual en páginas de producto, categoría y blog.
- [x] **Implementar paginación real** — Productos y blog con paginación server-side en vez de `perPage` fijo.
- [x] **Agregar structured data (JSON-LD)** — `Product`, `Organization`, `BreadcrumbList`, `BlogPosting`.
- [x] **Tipografía premium** — Evaluar agregar fuente serif para títulos (Playfair Display, Cormorant Garamond).
- [x] **Agregar sitemap.xml dinámico** — `src/app/sitemap.ts` que genere URLs de productos, categorías y posts.

---

## P3 — Evolución futura

- [ ] **Productos relacionados** — Sección con `related_ids` en la ficha de producto.
- [ ] **Variaciones de producto** — Selector de tallas/materiales/colores en la ficha.
- [ ] **Búsqueda de productos** — Barra de búsqueda en el Header conectada a WooCommerce.
- [ ] **Wishlist / Favoritos** — Lista de deseos con localStorage o cuenta de usuario.
- [ ] **Historial de pedidos** — En "Mi cuenta", mostrar pedidos del usuario vía API.
- [ ] **Filtros y ordenación** — En listado de productos y categoría (precio, popularidad, novedad).
- [ ] **Newsletter** — Suscripción al pie de página o en home.
- [ ] **Webhook de revalidación** — Endpoint en Next.js que WordPress llama al actualizar contenido para purgar caché ISR.
- [ ] **Internacionalización** — Preparar para posible soporte multi-idioma en el futuro.
- [ ] **Analytics** — Integrar Google Analytics 4 o Plausible con eventos de e-commerce.
- [ ] **PWA básica** — Manifest, service worker mínimo para experiencia mobile mejorada.

---

## Deuda técnica

- [ ] **Linting y format** — Configurar ESLint + Prettier con reglas consistentes y ejecutar en CI.
- [ ] **Testing** — Agregar al menos tests de los servicios de API y del carrito.
- [x] **Variables de entorno documentadas** — Crear `.env.example` actualizado sin las `NEXT_PUBLIC_WC_*`.
- [ ] **Convención de nombres de archivos** — Estandarizar a kebab-case (`add-to-cart-button.tsx` ya lo usa, pero mantener en componentes nuevos).
