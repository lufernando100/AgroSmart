# PLAN DE TRABAJO — AgroSmart (GranoVivo)
# Actualizar este archivo al completar, bloquear o iniciar cada tarea

**Leyenda:**
- ✅ Completado
- 🔄 En progreso
- ⏳ Pendiente
- 🔴 Bloqueado — ver nota

---

## FASE 1 — Marketplace
> Objetivo: un pedido real de punta a punta por WhatsApp y por PWA

### 1.1 Setup y Auth
- ✅ Proyecto Next.js 14+ con TypeScript, Tailwind, App Router
- ✅ Estructura de carpetas por dominio
- ✅ Tipos TypeScript de todas las entidades (`src/types/database.ts`)
- ✅ Clientes Supabase: browser, server, admin
- ✅ Archivos de referencia en `database/` y `docs/`
- ✅ Instalar `@supabase/supabase-js` y `@supabase/ssr`
- ✅ Crear proyecto en Supabase y configurar `.env.local`
- ✅ Ejecutar `database/01_data_model.sql` en Supabase
- ✅ Ejecutar `database/05_seed_data.sql` en Supabase
- ✅ `database/06_catalog_api_read.sql` — catálogo legible vía API (RLS/grants)
- ⏳ Generar tipos con `supabase gen types typescript`
- ✅ Login por OTP con teléfono (`POST /api/auth/otp` — send / verify) + página `/login`
- ✅ Middleware de protección de rutas (caficultor vs almacén; sesión Supabase)

### 1.2 Catálogo de productos
- ✅ `GET /api/productos` — lista con filtros por categoría (`categoria_id`, `sector`)
- ✅ `GET /api/productos/buscar` — texto (`q`) + opcional `lat`/`lng` (PostGIS vía RPC; ejecutar `database/07_fn_products_distance.sql`)
- ✅ Página `/catalogo` — lista con precio desde y número de almacenes
- ✅ Página `/catalogo/[id]` — detalle con comparador de precios por almacén

### 1.3 Flujo de pedido
- ✅ `POST /api/pedidos` — crear pedido, calcular total
- ✅ `PATCH /api/pedidos/[id]` — confirmar / rechazar / entregar
- ✅ Página `/catalogo/pedido` — selector vía `producto_id` + `almacen_id`, cantidad, notas
- ✅ Página `/catalogo/pedido/confirmacion` — número (GV-XXXXX) y estado
- ✅ Supabase Realtime en cliente (`PedidoEstadoRealtime`) — ejecutar `database/09_realtime_orders.sql` en Supabase

### 1.4 Panel del almacén
- ✅ `/almacen/dashboard` — pedidos pendientes, ingresos del día
- ✅ `/almacen/pedidos` — tabs: Pendientes | Confirmados | Entregados | Rechazados | Todos
- ✅ Acciones: confirmar, rechazar (con motivo), marcar entregado
- ✅ Notificación automática al caficultor al confirmar/rechazar (`PATCH` + `enviarMensajeWhatsApp`)
- ✅ `/almacen/productos` — editar precio en línea, toggle disponible/agotado (`PATCH /api/almacen/precios/[id]`)

### 1.5 Webhook de WhatsApp
- ✅ `GET /api/whatsapp/webhook` — verificación inicial de Meta
- ✅ `POST /api/whatsapp/webhook` — recibir y validar firma de Meta
- ✅ Parsear tipos: texto, audio (y extensible a imagen/ubicación en código)
- ✅ Patrón asíncrono: responder 200 inmediato, procesar en background
- ✅ Historial de conversación en tabla `conversaciones`
- ✅ Integrar Claude API con system prompt + tools
- ✅ Tool `buscar_productos` implementada y conectada a BD
- ✅ Tool `crear_pedido` implementada y conectada a BD
- ✅ Tool `notificar_almacen` implementada
- ✅ Nota de voz → transcribir con Whisper antes de enviar a Claude

### 1.6 Notificaciones WhatsApp
- ✅ Función `enviarMensajeWhatsApp(telefono, mensaje)` (`src/lib/whatsapp/send.ts`)
- ✅ Notificar almacén cuando llega pedido nuevo (`POST /api/pedidos`)
- ✅ Notificar caficultor cuando almacén confirma / rechaza (`PATCH /api/pedidos/[id]`)
- ✅ Almacén responde SI/NO por WhatsApp → actualizar estado (`intentarProcesarSiNoAlmacen`)

---

## FASE 2 — Inteligencia agronómica
> Depende de: Fase 1 completa

### 2.1 Análisis de suelo
- ⏳ `POST /api/suelo/interpretar` — recibe valores, clasifica con Cenicafé, genera recomendación
- ⏳ Flujo WhatsApp: foto → Claude Vision extrae → interpreta → recomienda → enlaza al catálogo
- ⏳ Página `/mi-finca/analisis` — tabla con semáforo (rojo/amarillo/verde) y recomendación
- ⏳ Botón: "Ver precios de este fertilizante" → lleva al comparador

### 2.2 Finca y lotes
- ⏳ Registro de finca con GPS (Google Maps)
- ⏳ CRUD de lotes con polígonos en el mapa
- ⏳ Página `/mi-finca` — mapa satelite + lista de lotes con estado y próxima acción
- ⏳ Detalle de lote: variedad, edad, densidad, sombrio, historial

### 2.3 Floraciones
- ⏳ `POST /api/floraciones` — registrar + fechas automáticas (trigger en BD)
- ⏳ Visualización en detalle del lote: cosecha estimada, fertilización, broca
- ⏳ Alertas proactivas por WhatsApp basadas en fechas calculadas

### 2.4 Alertas climáticas
- ⏳ Integrar API de clima (Open-Meteo) por coordenadas de la finca
- ⏳ Tool `consultar_clima` en el asistente
- ⏳ Alerta proactiva si lluvia + fecha de fertilización coinciden

---

## FASE 3 — Costos y monetización
> Depende de: Fase 1 completa, Fase 2 opcional

### 3.1 Registro de costos
- ⏳ Gasto automático al confirmar pedido (trigger ya en BD — verificar que funciona)
- ⏳ OCR de facturas: foto → Claude Vision → confirmar → registrar en `gastos`
- ⏳ Registro manual de jornales
- ⏳ Página `/mis-costos` — resumen, lista de gastos, jornales

### 3.2 Dashboard de costos
- ⏳ Costo por hectárea vs promedio nacional
- ⏳ Gráfico de barras por categoría (fertilizantes, mano de obra, agroquimicos...)
- ⏳ Simulador de rentabilidad: precio del café vs costos acumulados

### 3.3 Comisiones
- ⏳ Calcular y registrar comisión al confirmar pedido
- ⏳ Reporte de comisiones para el negocio

### 3.4 Compras colectivas
- ⏳ Pools de demanda por zona (`pools_compra` + `pool_participantes`)
- ⏳ Caficultor se une a pool existente o crea uno
- ⏳ Notificación cuando el pool alcanza el mínimo

---

## FASE 4 — Trazabilidad EUDR y escala
> Depende de: Fase 2 completa (requiere finca y lotes con GPS)

### 4.1 Pasaporte EUDR
- ⏳ Registro en `trazabilidad` por lote/cosecha
- ⏳ Verificación de coordenadas GPS (no deforestación)
- ⏳ Registro de buenas prácticas
- ⏳ Generar certificado PDF con QR único

### 4.2 API para exportadores
- ⏳ Endpoint autenticado para consultar trazabilidad por QR
- ⏳ Panel de exportador con mapa y datos de origen

---

## DISEÑO UI/UX
> Archivos de referencia de diseño agregados al proyecto

- ✅ `docs/06_diseno_ui.md` — Especificación completa de diseño: paleta de colores (tierra/café), tipografía (Plus Jakarta Sans), espaciado, componentes, iconografía, responsive, accesibilidad
- ✅ `docs/PROMPT_COMPLETO.md` — Prompt de desarrollo completo con contexto del proyecto, arquitectura, modelo de datos, flujos

### Implementados
- ✅ Fuente Plus Jakarta Sans via `next/font/google` en `src/app/layout.tsx`
- ✅ Paleta de colores tierra/café en `src/app/globals.css` (`@theme` con tokens `--color-primary-500` etc.)
- ✅ Fondos `#FAFAF8` (beige cálido) en layout y tarjetas
- ✅ Cards con `rounded-2xl`, sombras cálidas `shadow-[0_1px_3px_rgba(18,17,16,0.06)]` y borde `#E8E4DD`
- ✅ Tab bar inferior del caficultor (5 tabs: Inicio, Catálogo, Mi Finca, Mis Costos, Asistente)
- ✅ Sidebar desktop responsive (224px sidebar md+; tab bar solo mobile)
- ✅ Layout responsive corregido — desktop con sidebar, NO la vista de teléfono centrada
- ✅ Estados vacíos con `<MensajeVacio>` (`src/components/ui/MensajeVacio.tsx`)
- ✅ Elevación de tarjetas catálogo: `hover:-translate-y-0.5`, `hover:shadow-[0_4px_16px...]`, `active:translate-y-0`
- ✅ Haptic feedback CSS: `active:scale-[0.97]` en botones y `active:scale-90` en controles
- ✅ Quick Add (`src/components/catalogo/QuickAdd.tsx`) — botón `+` en tarjetas del catálogo con drawer inline, reduce el flujo de compra de 4 taps a 3

### Pendientes de implementar (diseño)
- ⏳ Skeleton loading para catálogo, precios, pedidos
- ⏳ Glassmorphism en sidebar desktop (solo, por costo GPU en Android 3G)
- ⏳ Bento grid para pantalla `/inicio`
- ⏳ Modo oscuro con paleta invertida
- ⏳ Service Worker para PWA offline

---

## PRUEBAS AUTOMATIZADAS
> Infraestructura: Vitest + React Testing Library

### Tests unitarios (utilidades puras)
- ✅ `src/lib/auth/phone.test.ts` — normalización teléfonos colombianos E.164 (10 tests)
- ✅ `src/lib/utils/format.test.ts` — formatCOP, formatFecha, formatRelativo, formatKm (15 tests)
- ✅ `src/lib/catalogo/uuid.test.ts` — validación UUID (7 tests)
- ✅ `src/lib/whatsapp/verifySignature.test.ts` — firma HMAC de Meta (6 tests)
- ✅ `src/lib/supabase/env.test.ts` — validación de variables de entorno (8 tests)
- ✅ `src/lib/utils/db-errors.test.ts` — mapeo Postgres → mensajes amigables (20 tests)

### Tests de lógica de negocio (con mocks)
- ✅ `src/lib/whatsapp/send.test.ts` — envío WhatsApp, validación, API mock (6 tests)
- ✅ `src/lib/whatsapp/processIncoming.test.ts` — procesamiento webhook entrante (7 tests)
- ✅ `src/lib/ai/execute-tools.test.ts` — ejecución de tools del asistente (8 tests)
- ✅ `src/lib/pedidos/service.test.ts` — tests negativos: caficultor no existe, almacén inactivo, items vacíos, FK violation (7 tests)

### Tests de componentes React
- ✅ `src/app/login/login-form.test.tsx` — flujo OTP + error amigable de perfil FK (9 tests)
- ✅ `src/components/pedidos/PedidoEstadoRealtime.test.tsx` — estados del pedido en tiempo real (6 tests)

**Total: 109 tests, 12 archivos — `npm test`**

---

## BLOQUEADOS
> Tareas que no pueden avanzar por alguna dependencia externa

_Ninguno por ahora._

---

## NOTAS Y DECISIONES

| Fecha | Nota |
|---|---|
| 2026-03-21 | Setup inicial completado. Dependencias instaladas: Next.js, Supabase, Claude SDK, OpenAI (Whisper). El proyecto compila sin errores. |
| 2026-03-21 | Próximo paso: crear proyecto en Supabase, ejecutar SQLs y configurar .env.local |
| 2026-03-21 | OTP API, sync `usuarios`↔auth (service role), middleware y placeholders `/catalogo`, `/almacen/dashboard`. |
| 2026-03-21 | `01_data_model.sql` aplicado en Supabase (RLS y tablas OK). Siguiente: `05_seed_data.sql`. |
| 2026-03-21 | Semilla corregida: IDs UUID válidos (antes `cat-fert`/`prod-001` fallaban con el esquema). Vuelve a ejecutar `05_seed_data.sql` en Supabase. |
| 2026-03-21 | `06_catalog_api_read.sql` aplicado; `npm run test:supabase` OK (6 cat, 21 prod, 3 alm, 15 precios). |
| 2026-03-21 | Catálogo 1.2: APIs `/api/productos`, `/api/productos/buscar`, páginas `/catalogo` y `/catalogo/[id]`, `lib/catalogo/queries.ts`. RPC distancia: `database/07_fn_products_distance.sql`. |
| 2026-03-21 | Fase 1.3–1.6: flujo PWA pedido/confirmación + Realtime (`09_realtime_orders.sql`), panel almacén (dashboard, pedidos, productos), API `PATCH /api/almacen/precios/[id]`, WhatsApp envío + webhook asíncrono + SI/NO almacén. |
| 2026-03-21 | Revisión Fase 1: build OK, 0 errores TypeScript. Agregados docs de diseño UI (`06_diseno_ui.md`, `PROMPT_COMPLETO.md`). Infraestructura de testing con Vitest + RTL: 81 tests cubriendo utils, lógica de negocio y componentes React. |
| 2026-03-22 | Bug crítico: cookies de sesión perdían opciones (httpOnly, maxAge) al propagarse en `/api/auth/otp`. Fix: buffer `pendingCookies` captura opciones completas de `setAll`. |
| 2026-03-22 | Diseño aplicado: paleta tierra/café, Plus Jakarta Sans, layout responsive con sidebar desktop (md+) + tab bar mobile. Se descartó vista de teléfono centrada. |
| 2026-03-22 | Errores amigables: `friendlyDbError()` en `db-errors.ts`, validación FK antes de INSERT en `pedidos`, `<MensajeError>` y `<MensajeVacio>` como componentes reutilizables. |
| 2026-03-22 | Validaciones: `notas` maxLength=500, `cantidad` min=1 max=9999 en cliente y servidor (`/api/pedidos`). |
| 2026-03-22 | Fotos de producto: `extractFotoUrl(metadata)` en queries, `<FotoProducto>` con placeholder en `CatalogoCliente`. |
| 2026-03-22 | Tests negativos: 109 tests, 12 archivos. Nuevos: `db-errors.test.ts` (20), `service.test.ts` pedidos (7), login-form con error FK (1). |
| 2026-03-22 | Diseño "Premium Agro-Tech": elevación de tarjetas (hover shadow + translate), haptic CSS (active:scale), Quick Add con drawer inline en tarjetas del catálogo. Framer Motion descartado (+44KB, lento en 3G). |
| 2026-03-22 | `listarMejoresPreciosPorProducto()` en queries.ts; CatalogoPage pasa `preciosPorProducto` a CatalogoCliente para activar QuickAdd. Build ✅ 109/109 tests ✅. |

