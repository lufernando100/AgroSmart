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
- ⏳ Instalar `@supabase/supabase-js` y `@supabase/ssr`
- ⏳ Crear proyecto en Supabase y configurar `.env.local`
- ⏳ Ejecutar `database/01_modelo_datos.sql` en Supabase
- ⏳ Ejecutar `database/05_datos_semilla.sql` en Supabase
- ⏳ Generar tipos con `supabase gen types typescript`
- ⏳ Login por OTP con teléfono (`/api/auth/otp`)
- ⏳ Middleware de protección de rutas (caficultor vs almacén)

### 1.2 Catálogo de productos
- ⏳ `GET /api/productos` — lista con filtros por categoría
- ⏳ `GET /api/productos/buscar` — búsqueda por texto + distancia (PostGIS)
- ⏳ Página `/catalogo` — lista con precio más bajo y número de almacenes
- ⏳ Página `/catalogo/[id]` — detalle con comparador de precios por almacén

### 1.3 Flujo de pedido
- ⏳ `POST /api/pedidos` — crear pedido, calcular total
- ⏳ `PATCH /api/pedidos/[id]` — confirmar / rechazar / entregar
- ⏳ Página `/catalogo/pedido` — selector de almacén, cantidad, notas
- ⏳ Página de confirmación con número de pedido (GV-XXXXX) y estado
- ⏳ Supabase Realtime para actualizar estado del pedido en tiempo real

### 1.4 Panel del almacén
- ⏳ `/almacen/dashboard` — pedidos pendientes (badge), ingresos del día
- ⏳ `/almacen/pedidos` — tabs: Pendientes | Confirmados | Entregados | Rechazados
- ⏳ Acciones: confirmar, rechazar (con razón), cambiar precio
- ⏳ Notificación automática al caficultor al confirmar/rechazar
- ⏳ `/almacen/productos` — editar precio en línea, toggle disponible/agotado

### 1.5 Webhook de WhatsApp
- ⏳ `GET /api/whatsapp/webhook` — verificación inicial de Meta
- ⏳ `POST /api/whatsapp/webhook` — recibir y validar firma de Meta
- ⏳ Parsear tipos: texto, audio, imagen, ubicación
- ⏳ Patrón asíncrono: responder 200 inmediato, procesar en background
- ⏳ Historial de conversación en tabla `conversaciones`
- ⏳ Integrar Claude API con system prompt + tools
- ⏳ Tool `buscar_productos` implementada y conectada a BD
- ⏳ Tool `crear_pedido` implementada y conectada a BD
- ⏳ Tool `notificar_almacen` implementada
- ⏳ Si nota de voz → transcribir con Whisper antes de enviar a Claude

### 1.6 Notificaciones WhatsApp
- ⏳ Función `enviarMensajeWhatsApp(telefono, mensaje)`
- ⏳ Notificar almacén cuando llega pedido nuevo
- ⏳ Notificar caficultor cuando almacén confirma / rechaza
- ⏳ Almacén responde SI/NO por WhatsApp → actualizar estado del pedido

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

## BLOQUEADOS
> Tareas que no pueden avanzar por alguna dependencia externa

_Ninguno por ahora._

---

## NOTAS Y DECISIONES

| Fecha | Nota |
|---|---|
| 2026-03-21 | Setup inicial completado. Próximo paso: crear proyecto en Supabase y configurar .env.local |

