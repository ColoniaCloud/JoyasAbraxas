# MercadoPago — Tareas pendientes para activar pagos

El código de integración ya está implementado (Opción B: Checkout Pro). Estas son las tareas necesarias para que funcione en producción.

---

## 1. Configurar variables de entorno

Agregar al archivo `.env` (o al proveedor de hosting):

```env
MP_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://www.joyasabraxas.com
```

- El `MP_ACCESS_TOKEN` se obtiene en: **Panel de MercadoPago → Tus integraciones → Credenciales de producción**
- `NEXT_PUBLIC_SITE_URL` es la URL pública donde está desplegado el frontend Next.js

---

## 2. Crear aplicación en MercadoPago

1. Ir a https://www.mercadopago.com.uy/developers/panel/app
2. Crear una nueva aplicación (si no existe)
3. Copiar el **Access Token de producción**
4. Copiar también el **Access Token de pruebas** (TEST-xxxx) para sandbox

---

## 3. Configurar webhook en MercadoPago

1. En el panel de MercadoPago → Tu aplicación → **Webhooks**
2. Agregar URL de notificación: `https://www.joyasabraxas.com/api/webhooks/mercadopago`
3. Seleccionar evento: **Payments**
4. Guardar

> Sin este paso, los pedidos en WooCommerce no se actualizarán automáticamente tras el pago.

---

## 4. Crear cuentas de prueba (sandbox)

1. En el panel de desarrolladores → **Cuentas de prueba**
2. Crear dos cuentas: una **vendedor** y una **comprador**
3. Usar el Access Token de pruebas (TEST-xxxx) en `.env` durante testing
4. Probar el flujo completo con la cuenta comprador

---

## 5. Probar flujo completo en sandbox

- [ ] Agregar productos al carrito
- [ ] Llenar formulario de checkout
- [ ] Click "Pagar con MercadoPago" → verificar redirect a MP
- [ ] Completar pago con cuenta de prueba
- [ ] Verificar return a `/checkout/resultado?status=success`
- [ ] Verificar que el pedido aparece en WooCommerce (admin WP → Pedidos)
- [ ] Verificar que el webhook actualiza el estado del pedido a "Procesando"

---

## 6. Probar casos de error

- [ ] Pago rechazado → return a `/checkout/resultado?status=failure`
- [ ] Pago pendiente (Abitab/Red Pagos) → return con `status=pending`
- [ ] Carrito vacío → no permite ir al checkout
- [ ] Campos obligatorios vacíos → validación del formulario

---

## 7. Pasar a producción

- [ ] Cambiar `MP_ACCESS_TOKEN` del de pruebas al de producción
- [ ] Actualizar `NEXT_PUBLIC_SITE_URL` a la URL final
- [ ] Actualizar URL del webhook en MercadoPago al dominio final
- [ ] Hacer un pedido de prueba real (puede ser de $1 y cancelarlo después)
- [ ] Verificar que los emails de confirmación de WooCommerce se envían

---

## Archivos involucrados

| Archivo | Función |
|---------|---------|
| `src/app/api/checkout/route.ts` | Crea pedido en WC + preferencia en MP |
| `src/app/api/webhooks/mercadopago/route.ts` | Recibe notificaciones de pago de MP |
| `src/lib/services/checkout.ts` | Lógica de negocio (WC Orders + MP API) |
| `src/lib/types/checkout.ts` | Tipos TypeScript del flujo |
| `src/app/checkout/page.tsx` | Formulario de checkout (frontend) |
| `src/app/checkout/resultado/page.tsx` | Página post-pago (success/failure/pending) |
| `.env.example` | Referencia de variables necesarias |
