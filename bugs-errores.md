# Bugs y Errores — Joyería Abraxas

Análisis del proyecto realizado el 11/04/2026. Listado por severidad.

---

## CRÍTICO — Seguridad

### 1. Credenciales de WooCommerce expuestas al cliente

**Archivo:** [src/lib/wp.ts](src/lib/wp.ts#L8-L9)

```typescript
const wcKey = process.env.WC_CONSUMER_KEY ?? process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
const wcSecret = process.env.WC_CONSUMER_SECRET ?? process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
```

El fallback a `NEXT_PUBLIC_WC_CONSUMER_KEY` / `NEXT_PUBLIC_WC_CONSUMER_SECRET` expone las credenciales de la API de WooCommerce al navegador del usuario. Cualquiera puede ver las keys en el bundle de JavaScript y usarlas para leer/escribir datos en tu tienda.

**Solución:** Eliminar los fallbacks `NEXT_PUBLIC_`. Usar solo `WC_CONSUMER_KEY` y `WC_CONSUMER_SECRET` (sin prefijo), que solo son accesibles server-side. Verificar que el archivo `.env` NO tenga estas variables con `NEXT_PUBLIC_`.

---

### 2. Imágenes remotas sin restricción de dominio

**Archivo:** [next.config.ts](next.config.ts#L5-L8)

```typescript
remotePatterns: [
  {
    protocol: "https",
    hostname: "**",  // ← permite CUALQUIER dominio
  },
],
```

`hostname: "**"` permite cargar imágenes de cualquier dominio externo. Esto abre la puerta a ataques de SSRF (Server-Side Request Forgery) a través del servicio de optimización de imágenes de Next.js.

**Solución:** Restringir a `api.joyasabraxas.com` y otros dominios necesarios explícitamente.

---

### 3. XSS potencial por `dangerouslySetInnerHTML` sin sanitización

**Archivos afectados:**
- [src/app/productos/[slug]/page.tsx](src/app/productos/%5Bslug%5D/page.tsx) — `short_description`, `description`, `review`
- [src/app/blog/[slug]/page.tsx](src/app/blog/%5Bslug%5D/page.tsx) — `content.rendered`
- [src/app/blog/page.tsx](src/app/blog/page.tsx) — `title.rendered`, `excerpt.rendered`

El HTML viene directamente de WordPress sin sanitizar. Si un usuario malicioso inyecta script en una reseña o si un plugin de WP genera HTML con script, se ejecutará en el navegador del visitante.

**Solución:** Sanitizar con una librería como `dompurify` (server-side con `isomorphic-dompurify`) o `sanitize-html` antes de renderizar.

---

## ALTO — Funcionalidad rota

### 4. Link roto en carrito: usa ID en vez de slug

**Archivo:** [src/app/carrito/page.tsx](src/app/carrito/page.tsx#L52)

```tsx
<Link href={`/productos/${item.product.id}`}>
```

La ruta de producto es `/productos/[slug]`, no `/productos/[id]`. Este link genera un 404 al hacer clic en el nombre del producto desde el carrito.

**Solución:** Cambiar a `/productos/${item.product.slug}`.

---

### 5. Checkout no funcional — simulación sin integración real

**Archivo:** [src/app/checkout/page.tsx](src/app/checkout/page.tsx#L12-L16)

```typescript
function handleSubmit(e: FormEvent) {
  e.preventDefault();
  // TODO: Integrar con WooCommerce Orders API
  clearCart();
  setSubmitted(true);
}
```

El checkout solo borra el carrito y muestra un mensaje. No crea pedido en WooCommerce, no procesa pago, no valida stock. El cliente cree que compró pero no se registra nada.

**Solución:** Ver [sistema-de-pagos.md](sistema-de-pagos.md) para el plan de integración completo.

---

### 6. Formulario de contacto sin funcionalidad

**Archivo:** [src/app/contacto/page.tsx](src/app/contacto/page.tsx)

El `<form>` no tiene `action`, `onSubmit` ni lógica de envío. El botón "Enviar mensaje" no hace nada.

**Solución:** Implementar envío vía API Route que reenvíe por email, o integrar con un servicio como Formspree, Resend, o un endpoint de WordPress.

---

### 7. Datos de contacto incorrectos

**Archivo:** [src/app/contacto/page.tsx](src/app/contacto/page.tsx#L57-L59)

```tsx
<p>📍 Buenos Aires, Argentina</p>
<p>✉️ hola@abraxas.com</p>
<p>📞 +54 11 0000-0000</p>
```

La joyería está en **Montevideo, Uruguay** y el WhatsApp es **+598 98 842 100** (según [MCP.md](MCP.md)). Los datos actuales son placeholder incorrectos.

---

## MEDIO — SEO y Performance

### 8. Sin caché ni revalidación en ningún fetch

**Archivo:** [src/lib/wp.ts](src/lib/wp.ts#L26-L33)

```typescript
const response = await fetch(url.toString());
```

Ningún `fetch` usa `next: { revalidate }` ni `next: { tags }`. En producción, Next.js puede cachear indefinidamente o no cachear nada según la configuración por defecto. Esto causa builds lentos y datos potencialmente desactualizados.

**Solución:** Agregar revalidación por tipo:
- Productos: `{ next: { revalidate: 1800, tags: ['products'] } }`
- Categorías: `{ next: { revalidate: 3600, tags: ['categories'] } }`
- Posts: `{ next: { revalidate: 3600, tags: ['posts'] } }`

---

### 9. URLs de categoría usan ID numérico en vez de slug

**Archivos:** Toda la app usa `/categorias/${cat.id}` y la ruta es `categorias/[id]`.

URLs como `/categorias/15` no son legibles ni amigables para SEO. Deberían ser `/categorias/anillos`.

**Solución:** Migrar la ruta a `categorias/[slug]` y usar `fetchCategoryBySlug()`.

---

### 10. Página Sale filtra productos en el frontend

**Archivo:** [src/app/sale/page.tsx](src/app/sale/page.tsx#L15-L19)

```typescript
const all = await fetchProducts({ perPage: 50 });
products = all.filter(
  (p) => p.sale_price && p.regular_price && p.sale_price !== p.regular_price
);
```

Trae 50 productos y los filtra en JS. Si hay más de 50, se pierden ofertas. Si hay pocas, se desperdician requests.

**Solución:** Usar el parámetro `on_sale=true` de la API de WooCommerce: `/wp-json/wc/v3/products?on_sale=true`.

---

### 11. Metadata SEO incompleta en la mayoría de páginas

Solo algunas páginas tienen `title`. Faltan:
- `description` con texto relevante
- Open Graph (`og:title`, `og:description`, `og:image`)
- Twitter cards
- Structured data (JSON-LD) para productos y organización

La página de producto tiene `generateMetadata` pero NO incluye Open Graph ni descripción.

---

## BAJO — Calidad de código y UX

### 12. Textos sin tildes ni caracteres correctos

Múltiples textos de la interfaz tienen faltas de ortografía:
- "Catalogo" → "Catálogo"
- "Descripcion" → "Descripción"
- "Resenas" → "Reseñas"
- "Categorias" → "Categorías"
- "Direccion" → "Dirección"
- "Telefono" → "Teléfono"
- "sesion" → "sesión"
- "Contrasena" → "Contraseña"
- "Codigo postal" → "Código postal"
- "Articulo" → "Artículo"

---

### 13. Sin página 404 personalizada

No existe `src/app/not-found.tsx`. Si un producto o página no existe, se muestra la 404 genérica de Next.js.

---

### 14. Sin estados de carga (loading.tsx)

No hay archivos `loading.tsx` en ninguna ruta. Las páginas con Server Components que hacen fetch no muestran ningún indicador de carga durante la navegación.

---

### 15. Sin componente Footer

No existe un Footer en todo el sitio. Faltan: enlaces legales, redes sociales, contacto rápido, copyright.

---

### 16. Componente ProductCard duplicado

La misma estructura de card (imagen + nombre + precio) se repite con variaciones en:
- [src/app/productos/page.tsx](src/app/productos/page.tsx)
- [src/app/categorias/[id]/page.tsx](src/app/categorias/%5Bid%5D/page.tsx)
- [src/app/sale/page.tsx](src/app/sale/page.tsx)
- [src/components/category-carousel.tsx](src/components/category-carousel.tsx)

Debería existir un solo `ProductCard` reutilizable.

---

### 17. Login endpoint como prop del componente

**Archivo:** [src/app/login/page.tsx](src/app/login/page.tsx#L8-L10)

```typescript
const authEndpoint =
  process.env.WP_AUTH_ENDPOINT ??
  `${process.env.WP_URL}/wp-json/jwt-auth/v1/token`;
```

Se pasa el endpoint de autenticación directamente como prop a un componente cliente. Si bien la URL en sí no es secreta, es mejor hacer el login a través de un Route Handler (`/api/auth/login`) para evitar exponer la estructura interna del backend.
