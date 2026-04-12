# Sistema de Pagos — MercadoPago + WooCommerce Headless

Plan de integración para que los pagos se procesen con MercadoPago y los pedidos se gestionen desde WooCommerce.

---

## Situación actual

- **WooCommerce** tiene el plugin de MercadoPago instalado y configurado como medio de pago.
- **El checkout actual** ([src/app/checkout/page.tsx](src/app/checkout/page.tsx)) es un formulario que no hace nada: solo borra el carrito local y muestra un mensaje.
- **El carrito** funciona con `localStorage` — no se sincroniza con WooCommerce.
- No se crea ningún pedido ni se procesa ningún pago.

---

## Análisis de opciones

### Opción A: Redirigir al checkout de WooCommerce

El usuario llena datos en Next.js y es redirigido al checkout de WooCommerce (donde ya está MercadoPago configurado).

| Pro | Contra |
|-----|--------|
| Mínimo desarrollo | UX rota: el cliente pasa de un sitio moderno a WP |
| MercadoPago ya funciona sin nada extra | Pierde la estética premium del frontend |
| WooCommerce gestiona todo el flujo | El usuario ve dos diseños distintos |

**Veredicto:** No recomendada para un proyecto premium. Rompe completamente la experiencia headless.

---

### Opción B: Checkout Pro de MercadoPago directo desde Next.js (RECOMENDADA)

El flujo completo sucede en Next.js. Se crea el pedido en WooCommerce vía API, se genera una preferencia de pago en MercadoPago, y el usuario paga en el entorno seguro de MercadoPago (redirect). Tras el pago, un webhook actualiza el pedido en WooCommerce.

| Pro | Contra |
|-----|--------|
| UX continua en el frontend moderno | Requiere Access Token de MercadoPago (server-side) |
| WooCommerce recibe el pedido completo | El plugin de MP en WC no se usa directamente |
| Flujo de pago seguro y probado (MercadoPago) | Hay que sincronizar estados WC ↔ MP manualmente |
| El joyero sigue gestionando pedidos desde WP | Configuración de webhooks necesaria |

**Veredicto: RECOMENDADA.** Mejor relación UX/complejidad. MercadoPago Checkout Pro es la opción oficial para Uruguay con tarjetas, Abitab, Red Pagos y cuenta MP.

---

### Opción C: Checkout Bricks (formulario embebido)

MercadoPago Checkout Bricks permite embeber campos de pago directamente en tu sitio. El formulario de tarjeta se renderiza en la propia página de checkout sin redirect.

| Pro | Contra |
|-----|--------|
| El cliente nunca sale de tu sitio | Mayor complejidad de integración |
| Máxima personalización visual | Requiere manejar PCI, seguridad, tokens |
| Control total del flujo | Menos medios de pago que Checkout Pro en UY |

**Veredicto:** Viable a futuro, pero excesiva para primera versión. Checkout Pro es más simple, más seguro y soporta todos los medios de pago de Uruguay.

---

## Plan de implementación — Opción B (Checkout Pro)

### Arquitectura del flujo

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js)                                             │
│                                                                 │
│  1. Cliente llena checkout form                                 │
│  2. Click "Pagar" →                                             │
│     POST /api/checkout  ─────────────────────────┐              │
│                                                   │              │
│  5. Redirect a MercadoPago ←─────────────────────┘              │
│  8. Return URL → /checkout/resultado?status=...                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (Next.js Route Handlers)                               │
│                                                                 │
│  POST /api/checkout                                             │
│    3. Crear pedido en WooCommerce (status: pending)             │
│    4. Crear preferencia en MercadoPago API                      │
│    → Devolver init_point (URL de pago) al frontend              │
│                                                                 │
│  POST /api/webhooks/mercadopago                                 │
│    6. Recibir notificación de pago de MercadoPago               │
│    7. Actualizar pedido en WooCommerce:                         │
│       - approved → processing                                   │
│       - rejected → failed                                       │
│       - pending → on-hold                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  WOOCOMMERCE                                                    │
│                                                                 │
│  - Recibe pedido con todos los datos del cliente                │
│  - Estado actualizado por webhook                               │
│  - El joyero gestiona el pedido normalmente desde el admin WP  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Paso 1: Variables de entorno necesarias

```env
# WooCommerce (ya existentes, sin NEXT_PUBLIC_)
WC_CONSUMER_KEY=ck_xxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxx

# MercadoPago (nuevas, NUNCA con NEXT_PUBLIC_)
MP_ACCESS_TOKEN=APP_USR-xxxxxxxx          # Access Token de producción
MP_ACCESS_TOKEN_TEST=TEST-xxxxxxxx        # Access Token de pruebas (sandbox)
MP_WEBHOOK_SECRET=tu-clave-secreta        # Para validar webhooks

# URLs de retorno
NEXT_PUBLIC_SITE_URL=https://tu-frontend.com
```

**Dónde obtener el Access Token:** Panel de MercadoPago → Tus integraciones → Credenciales de producción.

---

### Paso 2: Tipos TypeScript

```
src/lib/types/checkout.ts
```

```typescript
export interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address: string
  city: string
  postalCode?: string
  notes?: string
}

export interface CheckoutRequest {
  customer: CheckoutFormData
  items: {
    productId: number
    quantity: number
    price: string
    name: string
  }[]
}

export interface CheckoutResponse {
  orderId: number
  initPoint: string // URL de MercadoPago para redirect
}

export interface MPPreference {
  id: string
  init_point: string
  sandbox_init_point: string
}

export interface MPWebhookPayload {
  id: number
  live_mode: boolean
  type: string
  date_created: string
  action: string
  data: {
    id: string
  }
}
```

---

### Paso 3: Servicio de checkout (server-side)

```
src/lib/services/checkout.ts
```

```typescript
import type { CheckoutFormData } from '@/lib/types/checkout'

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!
const WC_KEY = process.env.WC_CONSUMER_KEY!
const WC_SECRET = process.env.WC_CONSUMER_SECRET!
const MP_TOKEN = process.env.MP_ACCESS_TOKEN!

/**
 * Crear pedido en WooCommerce con estado "pending"
 */
export async function createWCOrder(
  customer: CheckoutFormData,
  items: { productId: number; quantity: number }[]
) {
  const url = new URL('/wp-json/wc/v3/orders', WP_URL)
  url.searchParams.set('consumer_key', WC_KEY)
  url.searchParams.set('consumer_secret', WC_SECRET)

  const body = {
    payment_method: 'mercadopago',
    payment_method_title: 'MercadoPago',
    set_paid: false,
    status: 'pending',
    billing: {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      address_1: customer.address,
      city: customer.city,
      postcode: customer.postalCode || '',
      country: 'UY',
    },
    shipping: {
      first_name: customer.firstName,
      last_name: customer.lastName,
      address_1: customer.address,
      city: customer.city,
      postcode: customer.postalCode || '',
      country: 'UY',
    },
    line_items: items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    customer_note: customer.notes || '',
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || `Error creando pedido: ${res.status}`)
  }

  return res.json()
}

/**
 * Crear preferencia de pago en MercadoPago
 */
export async function createMPPreference(
  orderId: number,
  items: { name: string; quantity: number; price: number }[],
  customerEmail: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const body = {
    items: items.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'UYU',
    })),
    payer: {
      email: customerEmail,
    },
    back_urls: {
      success: `${siteUrl}/checkout/resultado?status=success`,
      failure: `${siteUrl}/checkout/resultado?status=failure`,
      pending: `${siteUrl}/checkout/resultado?status=pending`,
    },
    auto_return: 'approved',
    external_reference: String(orderId),
    notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    statement_descriptor: 'JOYAS ABRAXAS',
  }

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || `Error creando preferencia MP: ${res.status}`)
  }

  return res.json()
}

/**
 * Actualizar estado del pedido en WooCommerce
 */
export async function updateWCOrderStatus(orderId: number, status: string, transactionId?: string) {
  const url = new URL(`/wp-json/wc/v3/orders/${orderId}`, WP_URL)
  url.searchParams.set('consumer_key', WC_KEY)
  url.searchParams.set('consumer_secret', WC_SECRET)

  const body: Record<string, unknown> = { status }
  if (transactionId) {
    body.transaction_id = transactionId
  }

  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Error actualizando pedido ${orderId}: ${res.status}`)
  }

  return res.json()
}
```

---

### Paso 4: Route Handler — POST /api/checkout

```
src/app/api/checkout/route.ts
```

```typescript
import { NextResponse } from 'next/server'
import type { CheckoutRequest } from '@/lib/types/checkout'
import { createWCOrder, createMPPreference } from '@/lib/services/checkout'

export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json()

    // Validación básica
    if (!body.customer?.email || !body.items?.length) {
      return NextResponse.json(
        { error: 'Faltan datos del cliente o items' },
        { status: 400 }
      )
    }

    // 1. Crear pedido en WooCommerce
    const order = await createWCOrder(body.customer, body.items)

    // 2. Crear preferencia en MercadoPago
    const preference = await createMPPreference(
      order.id,
      body.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
      body.customer.email
    )

    // 3. Devolver URL de pago
    return NextResponse.json({
      orderId: order.id,
      initPoint: preference.init_point,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error procesando el checkout' },
      { status: 500 }
    )
  }
}
```

---

### Paso 5: Route Handler — Webhook de MercadoPago

```
src/app/api/webhooks/mercadopago/route.ts
```

```typescript
import { NextResponse } from 'next/server'
import { updateWCOrderStatus } from '@/lib/services/checkout'

const MP_TOKEN = process.env.MP_ACCESS_TOKEN!

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Solo procesar notificaciones de tipo payment
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
    }

    // Consultar el pago en MercadoPago para obtener estado real
    const paymentRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${MP_TOKEN}` },
      }
    )

    if (!paymentRes.ok) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const payment = await paymentRes.json()
    const orderId = parseInt(payment.external_reference, 10)

    if (!orderId) {
      return NextResponse.json({ error: 'Invalid external_reference' }, { status: 400 })
    }

    // Mapear estado de MercadoPago → WooCommerce
    const statusMap: Record<string, string> = {
      approved: 'processing',
      pending: 'on-hold',
      in_process: 'on-hold',
      rejected: 'failed',
      cancelled: 'cancelled',
      refunded: 'refunded',
    }

    const wcStatus = statusMap[payment.status] || 'on-hold'

    await updateWCOrderStatus(orderId, wcStatus, String(paymentId))

    return NextResponse.json({ received: true, orderId, status: wcStatus })
  } catch (error) {
    console.error('Webhook MP error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
```

---

### Paso 6: Actualizar página de checkout

Modificar [src/app/checkout/page.tsx](src/app/checkout/page.tsx) para que al hacer submit:
1. Recoja los datos del formulario + items del carrito
2. Haga POST a `/api/checkout`
3. Reciba `initPoint` (URL de MercadoPago)
4. Redirija al usuario a MercadoPago: `window.location.href = initPoint`
5. El usuario paga en MercadoPago y vuelve a `/checkout/resultado`

---

### Paso 7: Página de resultado

```
src/app/checkout/resultado/page.tsx
```

Página que recibe los query params de retorno de MercadoPago:
- `?status=success` → "¡Gracias! Tu pedido fue procesado correctamente."
- `?status=failure` → "El pago no pudo ser procesado. Intenta de nuevo."
- `?status=pending` → "Tu pago está siendo procesado. Te notificaremos por email."

Limpiar el carrito en `success` y `pending`.

---

## Estructura de archivos a crear

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts              ← Crear pedido + preferencia MP
│   │   └── webhooks/
│   │       └── mercadopago/
│   │           └── route.ts          ← Recibe notificaciones de pago
│   └── checkout/
│       ├── page.tsx                  ← Modificar (integrar con /api/checkout)
│       └── resultado/
│           └── page.tsx              ← Nueva (pantalla post-pago)
└── lib/
    ├── services/
    │   └── checkout.ts               ← Lógica de WC Orders + MP Preferences
    └── types/
        └── checkout.ts               ← Tipos para checkout y MP
```

---

## Configuración en MercadoPago

1. **Crear aplicación** en https://www.mercadopago.com.uy/developers/panel/app
2. Copiar **Access Token** de producción y de pruebas
3. En la sección **Webhooks**, configurar:
   - URL: `https://tu-frontend.com/api/webhooks/mercadopago`
   - Eventos: `payment`
4. Crear **cuentas de prueba** para testing (comprador + vendedor)

---

## Relación con el plugin de MercadoPago en WooCommerce

El plugin de MercadoPago para WooCommerce **no se usa directamente** en este flujo headless, pero **sigue siendo útil**:

- Mantiene la configuración de MercadoPago visible en el admin de WC
- Si en el futuro quieres fallback al checkout de WP, ya está listo
- Los pedidos creados vía API con `payment_method: 'mercadopago'` aparecen correctamente asociados al medio de pago

El `Access Token` que usas en Next.js debe ser **el mismo** de la cuenta de MercadoPago asociada al plugin de WC.

---

## Orden de implementación sugerido

1. Crear tipos (`checkout.ts`)
2. Crear servicio (`lib/services/checkout.ts`)
3. Crear Route Handler `/api/checkout`
4. Crear Route Handler `/api/webhooks/mercadopago`
5. Modificar `checkout/page.tsx` para usar la API
6. Crear `checkout/resultado/page.tsx`
7. Probar con cuentas de prueba de MercadoPago (sandbox)
8. Configurar webhook en panel de MercadoPago
9. Probar flujo completo end-to-end
10. Pasar a producción (cambiar Access Token)
