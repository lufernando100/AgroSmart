# PLAN DE TRABAJO — AgroSmart (GranoVivo)
# Actualizar este archivo al completar, bloquear o iniciar cada tarea

**Leyenda:**
- ✅ Completado
- 🔄 En progreso
- ⏳ Pendiente
- 🔴 Bloqueado — ver nota

**Esfuerzo estimado:**
- S = 1–2 días | M = 3–5 días | L = 1–2 semanas | XL = 2–4 semanas

---

## HITOS DE VALOR (Value Milestones)

Cada hito conecta funcionalidades con un KPI de negocio medible.

| Hito | Funcionalidades clave | KPI objetivo | Fases |
|---|---|---|---|
| H1 Primer pedido real | Catálogo + pedido + WhatsApp + almacén | 5 pedidos reales punta a punta | 1 ✅ |
| H2 Compra inteligente | Carrito multi-ítem + historial de precios + recomendación suelo→compra | Pedido promedio +30% ítems, conversión catálogo→pedido +15% | 1.7, 2.1, 4.4 |
| H3 Finca digital | Finca GPS + lotes + floraciones + calendario | 50% usuarios registran finca, 80% registran 1+ floración | 2.2, 2.3 |
| H4 Asistente omnicanal | Chat PWA + Vision OCR suelo + Vision OCR factura + clima | 40% interacciones por PWA chat, escalamiento humano <10% | 2.1, 2.4, 3.1, 4.1 |
| H5 Costos visibles | Registro gastos auto/manual + OCR factura + dashboard | 60% usuarios ven su costo/ha, 30% registran jornales | 3.1, 3.2 |
| H6 Alertas proactivas | Clima + fertilización + broca + precio | 1 alerta útil/semana por usuario, recompra +20% | 4.2 |
| H7 Compra colectiva | Pools de demanda por zona + negociación precio | 10 pools activos en 3 meses, ahorro promedio 8% | 4.3 |
| H8 Comisiones y negocio | Comisión al confirmar + reporte acumulado + dashboard admin | Break-even con 200 pedidos/mes | 3.3, 6.6 |
| H9 Trazabilidad EUDR | Pasaporte lote + API exportadores + certificado PDF | 1 exportador conectado, 100 lotes trazados | 5.1, 5.2 |
| H10 Plataforma robusta | Offline, push, onboarding, analytics, ratings | Retención D30 >40%, crash rate <1%, NPS >50 | 6.x |

---

## DECISIONES TÉCNICAS

| Fecha | Decisión | Razón |
|---|---|---|
| 2026-03-21 | Next.js 16 + App Router + React 19 | Server Components, streaming, estable |
| 2026-03-21 | Supabase (Postgres + PostGIS + Auth + Realtime) | Auth OTP, RLS, geoespacial, tiempo real incluido |
| 2026-03-21 | Claude API (Anthropic) para asistente | Tool calling nativo, Vision para OCR, calidad en español |
| 2026-03-21 | Whisper (OpenAI) para notas de voz | Mejor ASR en español colombiano |
| 2026-03-22 | Framer Motion descartado | +44KB, lento en 3G. CSS transitions suficientes |
| 2026-03-23 | Catálogo abierto sin login | Reducir fricción; OTP solo al hacer pedido |
| 2026-03-22 | QuickAdd inline drawer (no página separada) | 4 taps → 3 taps en flujo de compra |
| 2026-03-23 | Cenicafé tablas locales (no API) | Tablas estáticas, sin dependencia externa |
| 2026-03-24 | Zustand para estado global (carrito) | Ligero (1KB), persistencia localStorage nativa |
| 2026-03-24 | Pago offline al almacén | Sin procesador de pagos; comisión mensual post-entrega |
| Pendiente | Multi-rol usuario (caficultor+almacén) | Evaluar `user_roles` table vs rol único → ver R1 |
| Pendiente | Google Maps vs Mapbox para GPS finca | Google Maps por familiaridad, evaluar costo |
| Pendiente | Open-Meteo (gratis) para clima | Sin API key, coords directas, pronóstico 7 días |

---

## REFACTORINGS PREVENTIVOS
> Hacer ANTES de Fase 1.7 para evitar retrabajo costoso después

### R1 Multi-rol usuario [Esfuerzo: M]
> Bloquea: middleware, RLS, UI de almacén, onboarding
> Si se hace después: toca auth, middleware, RLS policies, UI — cada feature nueva multiplica el costo

- ⏳ Crear tabla `user_roles(user_id, role, is_active, created_at)` — migración SQL
- ⏳ Migrar datos existentes: insertar un registro en `user_roles` por cada usuario según su `role` actual
- ⏳ Agregar `active_role` al JWT o a `user_metadata` en Supabase Auth
- ⏳ Ajustar middleware (`src/middleware.ts`) para leer `active_role` en vez de `role` fijo
- ⏳ Ajustar RLS policies en BD para usar `user_roles` en vez de campo `role` directo
- ⏳ UI: selector de rol si el usuario tiene más de uno (dropdown en sidebar/header)
- ⏳ Tests: middleware multi-rol, RLS con ambos roles, switch de rol

### R2 Tipos Supabase auto-generados [Esfuerzo: S]
> Bloquea: cualquier tabla nueva amplía la brecha tipos manuales vs esquema real

- ⏳ Ejecutar `supabase gen types typescript --local > src/types/supabase.ts`
- ⏳ Reemplazar tipos manuales de `src/types/database.ts` con imports del archivo generado
- ⏳ Mantener `database.ts` solo para tipos de negocio derivados (no tablas directas)
- ⏳ Documentar en CLAUDE.md el comando de regeneración

### R3 Modularizar execute-tools.ts [Esfuerzo: S]
> Bloquea: implementación de las 7 tools restantes
> Si se hace después: archivo monolítico con 11 tools, difícil de testear y mantener

- ⏳ Crear directorio `src/lib/ai/tools/`
- ⏳ Extraer cada tool a su archivo: `buscar-productos.ts`, `crear-pedido.ts`, `notificar-almacen.ts`, `interpretar-suelo.ts`
- ⏳ Crear `src/lib/ai/tools/registry.ts` con patrón registry: `Record<string, ToolHandler>`
- ⏳ Simplificar `execute-tools.ts` a un dispatcher que llama al registry
- ⏳ Tests existentes deben seguir pasando sin cambios

### R4 API pedidos multi-ítem [Esfuerzo: S] — ✅
> Bloquea: carrito (1.7), chat PWA (4.1), pools (4.3)
> El esquema BD ya soporta `order_items`; la API acepta `items[]` con `product_id` + `quantity` + `warehouse_id` por línea (o `warehouse_id` raíz).

- ✅ `POST /api/pedidos` — `items: Array<{ product_id, quantity, warehouse_id? }>` + `warehouse_id` opcional en raíz
- ✅ `createOrdersForFarmer` en `service.ts` — un pedido por almacén, merge de líneas duplicadas (mismo producto)
- ✅ Compatibilidad: `product_id` + `warehouse_id` + `quantity` en raíz sin `items`
- ✅ WhatsApp al almacén: `buildNewOrderWhatsAppMessage` lista ítems con nombres (`whatsapp-order-summary.ts`)
- ⏳ Tests automatizados dedicados R4 (opcional); `service.test` cubre `createOrder`

---

## FASE 1 — Marketplace (COMPLETADA)
> Objetivo: un pedido real de punta a punta por WhatsApp y por PWA

### 1.1 Setup y Auth — ✅
- ✅ Proyecto Next.js 16 con TypeScript, Tailwind, App Router
- ✅ Estructura de carpetas por dominio
- ✅ Tipos TypeScript de todas las entidades (`src/types/database.ts`)
- ✅ Clientes Supabase: browser, server, admin
- ✅ Archivos de referencia en `database/` y `docs/`
- ✅ Instalar `@supabase/supabase-js` y `@supabase/ssr`
- ✅ Crear proyecto en Supabase y configurar `.env.local`
- ✅ Ejecutar `database/01_data_model.sql` en Supabase
- ✅ Ejecutar `database/05_seed_data.sql` en Supabase
- ✅ `database/06_catalog_api_read.sql` — catálogo legible vía API (RLS/grants)
- ⏳ Generar tipos con `supabase gen types typescript` → ver R2
- ✅ Login por OTP con teléfono (`POST /api/auth/otp` — send / verify) + página `/login`
- ✅ Middleware de protección de rutas (caficultor vs almacén; sesión Supabase)

### 1.2 Catálogo de productos — ✅
- ✅ `GET /api/productos` — lista con filtros por categoría (`categoria_id`, `sector`)
- ✅ `GET /api/productos/buscar` — texto (`q`) + opcional `lat`/`lng` (PostGIS vía RPC; ejecutar `database/07_fn_products_distance.sql`)
- ✅ Página `/catalogo` — lista con precio desde y número de almacenes
- ✅ Página `/catalogo/[id]` — detalle con comparador de precios por almacén

### 1.3 Flujo de pedido — ✅
- ✅ `POST /api/pedidos` — crear pedido, calcular total
- ✅ `PATCH /api/pedidos/[id]` — confirmar / rechazar / entregar
- ✅ Página `/catalogo/pedido` — selector vía `producto_id` + `almacen_id`, cantidad, notas
- ✅ Página `/catalogo/pedido/confirmacion` — número (GV-XXXXX) y estado
- ✅ Supabase Realtime en cliente (`PedidoEstadoRealtime`) — ejecutar `database/09_realtime_orders.sql` en Supabase

### 1.4 Panel del almacén — ✅
- ✅ `/almacen/dashboard` — pedidos pendientes, ingresos del día
- ✅ `/almacen/pedidos` — tabs: Pendientes | Confirmados | Entregados | Rechazados | Todos
- ✅ Acciones: confirmar, rechazar (con motivo), marcar entregado
- ✅ Notificación automática al caficultor al confirmar/rechazar (`PATCH` + `enviarMensajeWhatsApp`)
- ✅ `/almacen/productos` — editar precio en línea, toggle disponible/agotado (`PATCH /api/almacen/precios/[id]`)

### 1.5 Webhook de WhatsApp — ✅
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

### 1.6 Notificaciones WhatsApp — ✅
- ✅ Función `enviarMensajeWhatsApp(telefono, mensaje)` (`src/lib/whatsapp/send.ts`)
- ✅ Notificar almacén cuando llega pedido nuevo (`POST /api/pedidos`)
- ✅ Notificar caficultor cuando almacén confirma / rechaza (`PATCH /api/pedidos/[id]`)
- ✅ Almacén responde SI/NO por WhatsApp → actualizar estado (`intentarProcesarSiNoAlmacen`)

### 1.7 Carrito de Compras PWA — ✅ [Esfuerzo: M]
> Depende de: R4 (API multi-ítem)
> Habilita: H2 Compra inteligente

- ✅ Estado global con Zustand + persistencia (`src/lib/cart/store.ts`, `CartLine`)
- ✅ `QuickAdd` añade al carrito (no crea pedido al instante); enlace "Ver carrito"
- ✅ `SidebarCartLink` + `FloatingCartButton` (`src/components/cart/CartChrome.tsx`)
- ✅ Página `/carrito` — agrupado por almacén, vaciar, notas, confirmar → `POST /api/pedidos` multi-línea
- ✅ Confirmación multi-pedido: `/catalogo/pedido/confirmacion?ids=uuid,uuid`
- ✅ WhatsApp multi-ítem por pedido (R4)
- ⏳ Tests E2E/componente carrito (opcional)

---

## FASE 2 — Inteligencia Agronómica
> Depende de: Fase 1 completa
> Valor: el caficultor toma decisiones basadas en datos de SU finca

### 2.1 Análisis de suelo — 🔄 [Esfuerzo restante: M]
> Depende de: nada
> Habilita: H2, H4

**Completado:**
- ✅ `POST /api/suelo/interpretar` — recibe valores, clasifica con Cenicafé, genera recomendación (base implementada + persistencia en `soil_analysis`)
- ✅ Motor de interpretación Cenicafé (`src/lib/suelo/interpretation.ts`)
- ✅ Tool `interpretar_analisis_suelo` en `execute-tools.ts`
- ✅ `SoilAnalysisForm` componente con formulario manual de 6 nutrientes críticos
- ✅ Tabla de resultados con semáforo y recomendación

**Pendiente:**
- ⏳ Claude Vision OCR: enviar foto de análisis → extraer valores automáticamente [M]
  - API route `POST /api/suelo/ocr` — recibe imagen, llama Claude Vision, devuelve valores extraídos
  - UI: botón "Subir foto del análisis" con cámara/galería en `/mi-finca/analisis`
  - Preview de foto + spinner "Analizando tu suelo..."
  - Tabla editable de valores extraídos para que el caficultor corrija antes de interpretar
  - Guardar `image_url` en `soil_analysis`
- ⏳ Ampliar formulario a los 13 nutrientes completos (hoy solo 6 en UI) [S]
- ⏳ Deep-link recomendación → catálogo con filtro de producto sugerido [S]
  - El botón "Ver precios de este fertilizante" navega a `/catalogo?q={suggestedProductSearch}`
- ⏳ Historial de análisis anteriores con fecha y resumen [S]
  - Lista en `/mi-finca/analisis` debajo del formulario
  - Query a `soil_analysis WHERE user_id = current, ORDER BY created_at DESC`
- ⏳ Tool `comparar_precios` en `execute-tools.ts` — comparación específica por `producto_id` con distancias [S]
- ⏳ Tests: OCR mock, deep-link navigation, historial rendering, tool comparar_precios

### 2.2 Finca y lotes con mapa GPS — ⏳ [Esfuerzo: L]
> Depende de: Google Maps API key configurada
> Habilita: H3, requisito para 2.3, 2.4, 5.1

- ⏳ Página `/mi-finca` refactorizada: si tiene finca → mapa + lotes; si no → registro [M]
  - Flujo de registro: nombre, municipio, departamento, altitud, área
  - Captura de GPS actual o pin en mapa
  - Guardar en tabla `farms` con `location GEOGRAPHY(POINT)`
- ⏳ Componente `FarmMap` con Google Maps (satellite view) [M]
  - Marcador de la finca
  - Polígonos de lotes coloreados por status (verde=producción, amarillo=renovar, gris=nuevo)
  - `src/components/finca/FarmMap.tsx`
- ⏳ CRUD de lotes [S]
  - API routes: `POST/PATCH/DELETE /api/fincas/[farmId]/lotes`
  - Formulario: nombre, variedad, edad, densidad, sombrío, área, etapa
  - Dibujar polígono en el mapa (Google Maps Drawing Manager)
- ⏳ Detalle de lote `/mi-finca/lotes/[id]` [M]
  - Datos del lote + mapa con polígono
  - Último análisis de suelo (si hay) con semáforo resumido
  - Última floración + fechas calculadas
  - Próxima acción recomendada
  - Timeline de historial (floraciones, análisis, fertilizaciones)
- ⏳ Selector de finca/lote en `SoilAnalysisForm` (reemplazar UUID manual) [S]
  - Dropdown que carga fincas del usuario, luego lotes de esa finca
- ⏳ RLS: verificar que policies de `farms` y `plots` funcionan correctamente [S]
- ⏳ Tests: registro finca, CRUD lotes, mapa rendering, RLS [M]

### 2.3 Floraciones y calendario de cosecha — ⏳ [Esfuerzo: M]
> Depende de: 2.2 (necesita lotes)
> Habilita: H3, H6

- ⏳ API route `POST /api/floraciones` — registrar floración [S]
  - Recibe: `plot_id`, `flowering_date`, `intensity`, `notes`
  - El trigger `calculate_flowering_dates()` ya calcula: cosecha (+8m), fertilización (+6m), broca (+120d)
  - Devuelve registro con todas las fechas calculadas
- ⏳ Tool `registrar_floracion` en `execute-tools.ts` [S]
  - Conectar con la API, guardar en `flowering_records`
  - Devolver fechas calculadas al asistente para que informe al caficultor
- ⏳ UI de floración en detalle de lote [S]
  - Botón "Registrar floración"
  - Formulario: fecha, intensidad (alta/media/baja), notas
  - Vista de fechas calculadas con iconos: 🌾 cosecha, 💧 fertilización, 🐛 broca
- ⏳ Calendario visual en `/mi-finca`: timeline de próximos eventos por lote [M]
  - Tarjetas: "Lote 2 — Fertilizar en 12 días", "Lote 1 — Cosecha estimada Nov 2026"
  - Ordenado por proximidad
- ⏳ Tests: API floración, trigger de fechas, UI calendario [S]

### 2.4 Clima y alertas climáticas — ⏳ [Esfuerzo: M]
> Depende de: 2.2 (necesita coordenadas de finca)
> Habilita: H4, H6

- ⏳ Servicio de clima: `src/lib/weather/openmeteo.ts` [S]
  - Llamar Open-Meteo API con lat/lng de la finca
  - Devolver: temperatura, precipitación, humedad, pronóstico 7 días
  - Cache en memoria (1 hora) para no saturar la API
- ⏳ Tool `consultar_clima` en `execute-tools.ts` [S]
  - Buscar finca por ID → obtener coordenadas → llamar Open-Meteo
  - Devolver pronóstico formateado para el asistente
- ⏳ Tarjeta de clima en `/inicio` (home) [S]
  - Icono + temperatura + precipitación esperada + recomendación corta
  - "Buen día para fertilizar" / "Lluvia mañana, espera para aplicar"
- ⏳ Alerta cruzada clima + fertilización [M]
  - CRON o Edge Function: revisar fincas con `fertilization_date` en próximos 7 días
  - Si lluvia coincide → crear alerta en tabla `alerts`
  - Enviar WhatsApp proactivo: "Don Juan, mañana llueve fuerte. Espere al jueves para fertilizar."
- ⏳ Tests: servicio Open-Meteo mock, tool clima, alerta cruzada [S]

---

## FASE 3 — Costos, OCR y Monetización
> Depende de: Fase 1 completa; Fase 2 opcional (mejora el contexto)
> Valor: el caficultor sabe cuánto le cuesta producir; GranoVivo genera ingreso

### 3.1 Registro de costos y OCR de facturas — ⏳ [Esfuerzo: L]
> Depende de: nada
> Habilita: H5, H4

- ⏳ Verificar trigger `register_expense_on_order_confirm` funciona con pedidos reales [S]
  - El trigger ya existe en BD; validar que al confirmar un pedido se crea el gasto automáticamente
  - Si no funciona: corregir el trigger o agregar lógica en `PATCH /api/pedidos/[id]`
- ⏳ API routes para gastos manuales [M]
  - `POST /api/gastos` — crear gasto manual
  - `GET /api/gastos` — listar gastos del usuario (filtros: finca, lote, categoría, fecha)
  - Validaciones: monto > 0, fecha no futura, categoría válida
- ⏳ Tool `registrar_gasto` en `execute-tools.ts` [S]
  - Conectar con `POST /api/gastos`
  - Soportar origen: manual, ocr, marketplace
- ⏳ OCR de facturas con Claude Vision [M]
  - API route `POST /api/gastos/ocr` — recibe imagen, extrae datos con Vision
  - Extraer: proveedor, fecha, productos, cantidades, precios, total
  - Devolver JSON para confirmación del usuario
  - UI en `/mis-costos`: botón "Fotografiar factura" → preview → confirmar → registrar
  - Guardar `invoice_image_url` y `invoice_data` en `expenses`
- ⏳ Registro manual de jornales [M]
  - API routes: `POST/GET /api/jornales`
  - Página `/mis-costos/jornales` con lista + formulario
  - Formulario: trabajador, labor, días, pago/día, finca, lote, fecha
  - Total calculado automáticamente
- ⏳ Tool `consultar_costos` en `execute-tools.ts` [S]
  - Query con filtros a `expenses` + `labor_entries`
  - Devolver resumen por categoría, total, costo/ha
- ⏳ Página `/mis-costos` refactorizada: resumen real en vez de placeholder [M]
  - Selector de período: este mes | semestre | año
  - Tarjetas: total gastado, costo/ha, desglose por categoría
  - Lista de gastos recientes (paginada)
  - Tabs: Gastos | Jornales | Registrar
- ⏳ Tests: trigger verificación, API gastos, OCR mock, jornales, tool consultar_costos [M]

### 3.2 Dashboard de costos y rentabilidad — ⏳ [Esfuerzo: M]
> Depende de: 3.1
> Habilita: H5

- ⏳ Gráfico de barras por categoría (fertilizantes, mano de obra, agroquímicos, otros) [M]
  - Usar librería ligera: chart.js directo con canvas o SVG custom
  - Evaluar peso del bundle: <15KB adicional aceptable para 3G
- ⏳ Comparación costo/ha vs promedio nacional [S]
  - Datos de referencia: tabla `reference_prices` o constante configurable
  - Indicador visual: por encima/debajo del promedio
- ⏳ Simulador de rentabilidad [M]
  - Precio del café (input manual o dato de referencia)
  - Costos acumulados del período
  - Producción estimada (arrobas, input del caficultor)
  - Resultado: ingreso, costos, utilidad, margen
  - Slider interactivo: "Si el precio sube/baja…"
- ⏳ Tests: gráficos rendering, simulador cálculo, dashboard datos [S]

### 3.3 Comisiones del negocio — ⏳ [Esfuerzo: S]
> Depende de: nada (los pedidos ya se crean)
> Habilita: H8

- ⏳ Calcular comisión al confirmar pedido [S]
  - En `PATCH /api/pedidos/[id]` al cambiar status a `confirmed`:
    `commission = total * warehouse.commission_percentage / 100`
  - Guardar en `orders.commission`
- ⏳ Reporte de comisiones para administración [S]
  - Página `/admin/comisiones` (nueva ruta protegida por rol admin)
  - Resumen: comisiones del mes, acumulado, por almacén
  - Exportar a CSV
- ⏳ Tests: cálculo comisión, API, reporte [S]

---

## FASE 4 — Asistente Omnicanal, Alertas y Comunidad
> Depende de: Fase 2 parcial (finca+clima), Fase 3 parcial (costos)
> Valor: el caficultor recibe valor sin buscarlo; la comunidad amplifica

### 4.1 Chat PWA (Asistente IA en la app) — ⏳ [Esfuerzo: L]
> Depende de: R3 (tools modulares)
> Habilita: H4

- ⏳ Página `/chat` refactorizada: interfaz de chat real [L]
  - Componente `ChatContainer` con historial persistente (tabla `conversations`, canal=pwa)
  - Input de texto + botón enviar
  - Botón adjuntar foto (para OCR suelo o factura)
  - Botón de audio (grabar nota de voz → Whisper → transcribir)
  - Mensajes con burbujas (usuario vs asistente)
  - Chips de sugerencia rápida: "Buscar fertilizante", "Mis costos", "Clima hoy"
  - Streaming de respuesta (Claude streaming API)
- ⏳ API route `POST /api/chat` [M]
  - Recibe: `message` (texto o `audio_url` o `image_url`), `user_id`
  - Reutiliza la misma lógica de `claudeWhatsApp.ts` pero con canal=pwa
  - Guarda conversación en `conversations`
  - Devuelve respuesta (stream o JSON)
- ⏳ Tool `consultar_perfil_caficultor` en `execute-tools.ts` [S]
  - Query completa: usuario + fincas + lotes + último análisis + pedidos recientes + costos
  - Para que el asistente tenga contexto completo del caficultor
- ⏳ Tool `escalar_a_humano` en `execute-tools.ts` [S]
  - Crear alerta de tipo 'general' con la razón
  - Marcar conversación como `escalated_to_human = true`
  - (Futuro: notificar equipo por email o Slack)
- ⏳ Tests: chat UI, API, tools nuevas [M]

### 4.2 Sistema de alertas proactivas — ⏳ [Esfuerzo: L]
> Depende de: 2.2 (finca), 2.3 (floraciones), 2.4 (clima)
> Habilita: H6

- ⏳ Motor de alertas: `src/lib/alerts/engine.ts` [M]
  - Función que revisa condiciones y genera alertas
  - Tipos de alerta:
    - `weather`: lluvia + fertilización coinciden
    - `fertilization`: fecha de fertilización en próximos 7 días
    - `harvest`: cosecha estimada en próximo mes
    - `pest`: período crítico de broca activo
    - `price`: precio de producto favorito bajó X%
  - Guardar en tabla `alerts`
- ⏳ CRON job o Supabase Edge Function para ejecutar motor diariamente [M]
  - Recorrer usuarios con fincas activas
  - Generar alertas relevantes
  - Enviar por WhatsApp a quienes tengan teléfono registrado
- ⏳ Notificaciones en `/inicio` (home) [S]
  - Tarjetas deslizables de alertas no leídas
  - Botón "Marcar como leída"
  - Badge en tab Inicio cuando hay alertas sin leer
- ⏳ Alertas de precio [S]
  - Cuando un precio en `price_history` baja más de 5% → generar alerta
  - "El 25-4-24 bajó un 12% en Almacén El Campo. Antes $185,000, ahora $163,000."
- ⏳ Tests: engine de alertas, generación, envío, UI [M]

### 4.3 Compras colectivas (pools) — ⏳ [Esfuerzo: L]
> Depende de: Fase 1 (marketplace funcional)
> Habilita: H7

- ⏳ API routes para pools [M]
  - `POST /api/pools` — crear pool (producto, municipio, cantidad mínima, deadline)
  - `GET /api/pools` — listar pools activos en la zona del caficultor
  - `POST /api/pools/[id]/join` — unirse a un pool (cantidad)
  - `PATCH /api/pools/[id]` — cerrar/activar pool
- ⏳ Página `/catalogo/pools` (o sección en catálogo) [M]
  - Lista de pools activos cerca del caficultor
  - Barra de progreso: "23 de 50 bultos — faltan 27 para activar"
  - Botón "Unirme con X bultos"
- ⏳ Notificación cuando pool alcanza mínimo [S]
  - WhatsApp a todos los participantes
  - "El pool de 25-4-24 en Pitalito ya alcanzó el mínimo. ¡Descuento del 8%!"
- ⏳ Lógica de conversión pool → pedidos individuales [M]
  - Al activarse el pool, crear pedidos para cada participante
  - Negociar precio con almacén (manual inicialmente)
- ⏳ Tests: API pools, join, activación, notificación [M]

### 4.4 Historial y gráficos de precios — ⏳ [Esfuerzo: M]
> Depende de: nada (`price_history` ya se llena con trigger)
> Habilita: H2

- ⏳ API route `GET /api/productos/[id]/historial-precios` [S]
  - Query a `price_history`: precios por almacén, últimos 6 meses
  - Agrupar por mes, calcular promedio/min/max
- ⏳ Gráfico mini en `/catalogo/[id]` (detalle de producto) [M]
  - Gráfico de línea mostrando evolución del precio
  - Líneas por almacén (colores diferentes)
  - Referencia SIPSA si existe en `reference_prices`
- ⏳ Tests: API historial, gráfico rendering [S]

---

## FASE 5 — Trazabilidad EUDR y Escala
> Depende de: Fase 2 completa (requiere finca y lotes con GPS)
> Valor: acceso a mercados premium para el caficultor; datos para exportadores

### 5.1 Pasaporte EUDR — ⏳ [Esfuerzo: XL]
> Depende de: 2.2 (finca con GPS y lotes con polígonos)
> Habilita: H9

- ⏳ Registro en `traceability` por lote/cosecha [M]
  - API route `POST /api/trazabilidad` — crear registro
  - Datos: `plot_id`, `harvest_period`, buenas prácticas (JSON checklist)
- ⏳ Verificación de coordenadas GPS vs datos de deforestación [L]
  - Integrar con dataset de Global Forest Watch o similar
  - Validar que polígono del lote no intersecta áreas deforestadas post-2020
  - Guardar `deforestation_verified = true/false`
- ⏳ Registro de buenas prácticas [S]
  - Checklist: sombrío >30%, conservación suelos, manejo integrado plagas, etc.
  - Guardar en `traceability.good_practices` (JSONB)
- ⏳ Generar certificado PDF con QR único [M]
  - Usar librería de PDF server-side
  - QR que enlaza a `/verificar/[qr_code]`
  - Guardar `certificate_url` en Supabase Storage
- ⏳ Página `/mi-finca/trazabilidad` — resumen por lote [M]
- ⏳ Tests: API, verificación GPS, generación PDF [M]

### 5.2 API para exportadores — ⏳ [Esfuerzo: L]
> Depende de: 5.1
> Habilita: H9

- ⏳ Endpoint autenticado `GET /api/export/traceability/[qr]` [M]
  - Devuelve datos de origen: finca, lote, coordenadas, buenas prácticas, fechas
  - Autenticación por API key (tabla `api_keys`, nueva)
- ⏳ Panel de exportador `/exportador/dashboard` [L]
  - Mapa con lotes verificados
  - Datos de origen por QR
  - Descarga de certificado
- ⏳ Tests: API autenticada, panel [M]

---

## FASE 6 — Plataforma Robusta y Crecimiento
> Depende de: fases anteriores según la tarea
> Valor: retención, experiencia, confiabilidad

### 6.1 PWA Offline (Service Worker + IndexedDB) — ⏳ [Esfuerzo: XL]
> Depende de: nada
> Habilita: H10

- ⏳ Service Worker con estrategia cache-first para assets estáticos [M]
  - next-pwa o Workbox manual
  - Precache de shell: layout, iconos, fuentes
  - Runtime cache de páginas del catálogo
- ⏳ IndexedDB para datos pendientes [L]
  - Cola de acciones offline: pedidos, gastos, floraciones
  - Sync automático cuando vuelve la conexión
  - Indicador visual "Sin conexión" / "Sincronizando…"
- ⏳ Captura GPS offline para registro de finca/lotes [M]
- ⏳ Cache de catálogo para consulta offline [S]
- ⏳ `manifest.json` con iconos, theme, display: standalone [S]
  - Archivo ya existe en `public/manifest.json`
- ⏳ Tests: SW registration, offline queue, sync [M]

### 6.2 Push notifications (Web Push) — ⏳ [Esfuerzo: M]
> Depende de: 6.1 (Service Worker)
> Habilita: H10

- ⏳ Suscripción a push notifications [S]
  - Prompt al usuario con explicación del valor
  - Guardar suscripción en tabla `push_subscriptions` (nueva)
- ⏳ Enviar push cuando: pedido confirmado, alerta generada, pool activado [M]
  - Servicio server-side con web-push library
  - Fallback a WhatsApp si no tiene push habilitado
- ⏳ Tests: suscripción, envío, fallback [S]

### 6.3 Onboarding para nuevos caficultores — ⏳ [Esfuerzo: M]
> Depende de: 2.2 (registro de finca)
> Habilita: H10

- ⏳ Flujo post-login para usuarios nuevos (sin finca) [M]
  - Paso 1: "¿Cómo te llamas?" (nombre)
  - Paso 2: "¿Dónde queda tu finca?" (municipio, departamento, GPS)
  - Paso 3: "¿Cuántas hectáreas de café tienes?" (área)
  - Paso 4: "¿Tienes análisis de suelo reciente?" (opcional: foto o skip)
  - Al terminar: redirigir a `/inicio` con datos populados
- ⏳ Indicador de progreso (steps 1–4) con skip option [S]
- ⏳ Tests: flujo completo, skip, datos guardados [S]

### 6.4 Skeleton loading y estados de carga — ⏳ [Esfuerzo: S]
> Depende de: nada
> Habilita: H10

- ⏳ Skeleton para catálogo (tarjetas placeholder animadas)
- ⏳ Skeleton para precios en detalle de producto
- ⏳ Skeleton para pedidos en panel almacén
- ⏳ Skeleton para costos y jornales

### 6.5 Rating y reseñas de almacenes — ⏳ [Esfuerzo: M]
> Depende de: pedidos entregados existentes
> Habilita: H10

- ⏳ Tabla `warehouse_reviews` (nueva migración) [S]
  - `user_id`, `warehouse_id`, `order_id`, `rating` (1–5), `comment`, `created_at`
  - Único: un review por `order_id`
- ⏳ Prompt al caficultor después de pedido entregado [S]
  - "¿Cómo te fue con Almacén El Campo? Califica de 1 a 5 estrellas."
  - En PWA: modal post-entrega
  - En WhatsApp: mensaje proactivo
- ⏳ Mostrar rating promedio en catálogo y detalle de producto [S]
  - Estrellas junto al nombre del almacén en comparador de precios
- ⏳ Tests: review CRUD, prompt, rating display [S]

### 6.6 Dashboard de negocio (admin) — ⏳ [Esfuerzo: L]
> Depende de: datos acumulados de uso
> Habilita: H8, H10

- ⏳ Ruta `/admin/dashboard` protegida por rol admin [M]
  - Métricas: pedidos totales, GMV, comisiones, usuarios activos
  - Gráficos: pedidos por día, GMV por semana, crecimiento usuarios
  - Funnel: visitas catálogo → pedido → confirmado → entregado
- ⏳ Reportes de almacenes [S]
  - Top almacenes por pedidos
  - Almacenes con mayor rechazo
  - Tiempos de respuesta
- ⏳ Métricas del asistente IA [S]
  - Conversaciones/día, tokens consumidos, costo estimado
  - Tasa de escalamiento a humano
  - Tools más usadas
- ⏳ Tests: dashboard rendering, queries [S]

### 6.7 Almacén: reportes y OCR de precios — ⏳ [Esfuerzo: M]
> Depende de: pedidos confirmados existentes
> Habilita: H8

- ⏳ Página `/almacen/reportes` [M]
  - Ventas del mes vía GranoVivo
  - Productos más pedidos (ranking)
  - Caficultores frecuentes
  - Comparación de precios vs competencia (anonimizado)
- ⏳ Subir foto de lista de precios → OCR → actualizar precios masivos [L]
  - Claude Vision extrae: producto, precio, disponibilidad
  - Preview y confirmación antes de aplicar
- ⏳ Tests: reportes, OCR precios [M]

### 6.8 Motor de recomendaciones — ⏳ [Esfuerzo: L]
> Depende de: 2.1 (suelo), 2.3 (floraciones), historial de compras
> Habilita: H2, H6

- ⏳ Servicio `src/lib/recommendations/engine.ts` [L]
  - Inputs: análisis de suelo, floraciones, historial de pedidos, época del año
  - Outputs: productos recomendados con razón
  - Ej: "Basado en tu suelo bajo en magnesio y tu próxima fertilización en 15 días, te recomendamos 23-4-20-3-4"
- ⏳ Sección "Recomendado para ti" en `/inicio` y `/catalogo` [M]
  - Tarjetas de producto con razón de la recomendación
  - "Tu suelo necesita magnesio" + producto + precio
- ⏳ Recomendaciones proactivas por WhatsApp [S]
  - Integrar con motor de alertas (4.2)
- ⏳ Tests: engine lógica, UI rendering [M]

---

## IMPLEMENTACIÓN DE TOOLS DEL ASISTENTE IA

Las 11 tools definidas en `docs/02_system_prompt_tools.ts`. Estado en `src/lib/ai/execute-tools.ts`.

| Tool | Estado | Fase | Esfuerzo |
|---|---|---|---|
| `buscar_productos` | ✅ | 1.5 | — |
| `comparar_precios` | ⏳ | 2.1 | S |
| `crear_pedido` | ✅ | 1.5 | — |
| `interpretar_analisis_suelo` | ✅ | 2.1 | — |
| `registrar_gasto` | ⏳ | 3.1 | S |
| `consultar_costos` | ⏳ | 3.1 | S |
| `consultar_clima` | ⏳ | 2.4 | S |
| `consultar_perfil_caficultor` | ⏳ | 4.1 | S |
| `registrar_floracion` | ⏳ | 2.3 | S |
| `escalar_a_humano` | ⏳ | 4.1 | S |
| `notificar_almacen` | ✅ | 1.5 | — |

**Nota:** `comparar_precios` ya tiene búsqueda por texto pero falta la comparación específica por `producto_id` con distancias. Requiere nueva query a `prices JOIN warehouses` con PostGIS.

---

## DISEÑO UI/UX
> Archivos de referencia: `docs/06_diseno_ui.md`, `docs/04_wireframes.md`

### Implementados
- ✅ Fuente Plus Jakarta Sans vía `next/font/google` en `src/app/layout.tsx`
- ✅ Paleta de colores tierra/café en `src/app/globals.css` (`@theme` con tokens `--color-primary-500` etc.)
- ✅ Fondos `#FAFAF8` (beige cálido) en layout y tarjetas
- ✅ Cards con `rounded-2xl`, sombras cálidas `shadow-[0_1px_3px_rgba(18,17,16,0.06)]` y borde `#E8E4DD`
- ✅ Tab bar inferior del caficultor (5 tabs: Inicio, Catálogo, Mi Finca, Mis Costos, Asistente)
- ✅ Sidebar desktop responsive (224px sidebar md+; tab bar solo mobile)
- ✅ Layout responsive corregido — desktop con sidebar, NO la vista de teléfono centrada
- ✅ Estados vacíos con `<MensajeVacio>` (`src/components/ui/MensajeVacio.tsx`)
- ✅ Elevación de tarjetas catálogo: `hover:-translate-y-0.5`, `hover:shadow-[0_4px_16px...]`, `active:translate-y-0`
- ✅ Haptic feedback CSS: `active:scale-[0.97]` en botones y `active:scale-90` en controles
- ✅ Quick Add (`src/components/catalogo/QuickAdd.tsx`) — botón `+` en tarjetas del catálogo con drawer inline

### Pendientes de implementar (diseño)
- ⏳ Skeleton loading para catálogo, precios, pedidos (ver 6.4)
- ⏳ Glassmorphism en sidebar desktop (solo si no afecta 3G)
- ⏳ Bento grid para pantalla `/inicio`
- ⏳ Modo oscuro con paleta invertida
- ⏳ Service Worker para PWA offline (ver 6.1)

---

## PRUEBAS AUTOMATIZADAS
> Infraestructura: Vitest + React Testing Library + Playwright (E2E)

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
- ✅ `src/lib/pedidos/service.test.ts` — tests negativos: caficultor no existe, almacén inactivo, ítems vacíos, FK violation (7 tests)

### Tests de componentes React
- ✅ `src/app/login/login-form.test.tsx` — flujo OTP + error amigable de perfil FK (9 tests)
- ✅ `src/components/pedidos/PedidoEstadoRealtime.test.tsx` — estados del pedido en tiempo real (6 tests)

### Tests de interpretación de suelo
- ✅ `src/lib/suelo/interpretation.test.ts` — motor Cenicafé
- ✅ `src/components/finca/SoilAnalysisForm.test.tsx` — formulario componente
- ✅ `src/app/api/suelo/interpretar/route.test.ts` — API endpoint

**Total actual: 109+ tests, 12+ archivos — `npm test`**

### Tests pendientes por fase
- ⏳ Carrito: store Zustand + componente `/carrito` + API multi-ítem (1.7)
- ⏳ OCR suelo mock + deep-link + historial (2.1)
- ⏳ Finca GPS + CRUD lotes + mapa (2.2)
- ⏳ Floración API + trigger + calendario (2.3)
- ⏳ Clima Open-Meteo mock + tool (2.4)
- ⏳ Gastos API + OCR factura + jornales (3.1)
- ⏳ Dashboard costos + simulador (3.2)
- ⏳ Comisión cálculo + reporte (3.3)
- ⏳ Chat PWA UI + API + tools nuevas (4.1)
- ⏳ Alertas engine + envío + UI (4.2)
- ⏳ Pools API + join + activación (4.3)
- ⏳ Historial precios + gráfico (4.4)

---

## BLOQUEADOS
> Tareas que no pueden avanzar por alguna dependencia externa

_Ninguno por ahora._

**Posibles bloqueos futuros:**
- Google Maps API key no configurada → bloquea 2.2 (finca con mapa)
- Dataset de deforestación no disponible → bloquea 5.1 (verificación EUDR)
- Web Push requiere HTTPS en producción → verificar Vercel config para 6.2

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
| 2026-03-23 | Inicio Fase 2.1: API `POST /api/suelo/interpretar`, motor de interpretación Cenicafé (`src/lib/suelo/interpretation.ts`), UI inicial `/mi-finca/analisis`, y pruebas unitarias + endpoint + componente. |
| 2026-03-23 | Decisión de negocio: abrir catálogo sin login (`/catalogo`, `/catalogo/[id]`) y exigir OTP solo al pasar a intención de compra (`/catalogo/pedido`) y rutas privadas. Objetivo: reducir fricción de entrada y aumentar conversión a pedido real. Validar 1-2 semanas con funnel: visitas catálogo → clic "Hacer pedido" → OTP completado → pedido creado. |
| 2026-03-24 | Tema a discutir en planificación: soportar doble rol (caficultor + almacén) con el mismo celular/OTP. Estado actual: 1 usuario = 1 `role`; hoy requiere alternar `users.role`. Evaluar diseño multi-rol (`user_roles` + `active_role` de sesión) vs mantener un rol único por simplicidad. |
| 2026-03-24 | Decisión de negocio: Se aprueba el desarrollo del Hito 1.7 "Carrito de Compras multi-ítem" para la PWA. El pago seguirá siendo offline directo al almacén. AgroSmart cobrará comisión mensual post-entrega. |
| 2026-03-24 | PLAN.md expandido: 6 fases + refactorings preventivos (R1-R4) + hitos de valor (H1-H10) + tracker de 11 tools AI + estimaciones de esfuerzo. Visión completa de producto, no solo MVP. |
| 2026-03-24 | R4 + 1.7 implementados: `createOrdersForFarmer`, `POST /api/pedidos` con `grand_total` + respuesta `orders[]`, Zustand `src/lib/cart/store.ts`, `/carrito`, QuickAdd → carrito, WhatsApp con líneas por producto. Dependencia `zustand`. |
