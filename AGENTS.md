# AGENTES.md — AgroSmart (GranoVivo)
# Instrucciones completas para el agente de desarrollo

---

## QUÉ ES ESTE PROYECTO

AgroSmart es una plataforma digital para caficultores colombianos con dos canales:
1. **WhatsApp** — canal principal de interacción. Un asistente de IA opera como vendedor y agrónomo digital 24/7.
2. **PWA** — app web complementaria para consultas detalladas, mapas y dashboards.

Ambos canales comparten el mismo backend y la misma base de datos.

**Modelo de negocio:** Gratuito para caficultores. Ingresos por comisiones a almacenes (3-5%), fees financieros, datos de trazabilidad EUDR, bonos de carbono.

**Usuarios:**
- Caficultores pequeños/medianos (1-10 ha) — usuario principal
- Almacenes agrícolas — publican precios, reciben pedidos
- Cooperativas — canal de distribución
- Exportadores (futuro) — trazabilidad EUDR

---

## STACK TÉCNICO

```
Frontend + Backend:  Next.js 14+ con App Router, TypeScript estricto
Base de datos:       Supabase (PostgreSQL + PostGIS + Auth + Storage + Realtime)
Hosting:             Vercel
Motor IA:            Claude API (Anthropic) — asistente, visión, OCR, interpretación de suelos
Canal WhatsApp:      WhatsApp Business Cloud API (Meta)
Voz a texto:         Whisper API (OpenAI)
Mapas:               Google Maps Platform
```

---

## ESTRUCTURA DEL REPOSITORIO

```
AgroSmart/
├── database/
│   ├── 01_modelo_datos.sql     # Esquema completo PostgreSQL/PostGIS — LEER ANTES DE TOCAR BD
│   └── 05_datos_semilla.sql    # Datos de ejemplo: categorías, productos, almacenes, precios
├── docs/
│   ├── 02_system_prompt_tools.ts  # System prompt y 11 tools del asistente IA
│   ├── 03_flujos_whatsapp.md      # 8 flujos conversacionales completos
│   └── 04_wireframes.md           # Todas las pantallas de la PWA con contenido detallado
├── src/
│   ├── app/
│   │   ├── (caficultor)/       # Home, Catálogo, Mi Finca, Mis Costos, Chat
│   │   ├── (almacen)/          # Dashboard, Pedidos, Productos, Reportes
│   │   └── api/
│   │       ├── whatsapp/webhook/   # Webhook de Meta — punto de entrada de WhatsApp
│   │       ├── pedidos/            # CRUD de pedidos
│   │       ├── productos/buscar/   # Búsqueda de productos con precios y distancia
│   │       ├── suelo/interpretar/  # Interpretación de análisis de suelo con Claude
│   │       └── auth/otp/           # Login por OTP/SMS
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Cliente browser (componentes React)
│   │   │   ├── server.ts       # Cliente server (Server Components, API routes)
│   │   │   └── admin.ts        # Cliente con service role (operaciones privilegiadas)
│   │   ├── ai/
│   │   │   └── system_prompt_tools.ts  # System prompt + definición de tools (Claude)
│   │   ├── cenicafe/
│   │   │   └── tablas.ts       # Niveles críticos de nutrientes y recomendaciones Cenicafé
│   │   └── utils/
│   │       └── format.ts       # Formato COP, fechas en español colombiano
│   ├── types/
│   │   └── database.ts         # Tipos TypeScript de todas las entidades
│   └── components/
│       ├── ui/                 # Componentes base reutilizables
│       ├── catalogo/           # Componentes del marketplace
│       ├── pedidos/            # Componentes de pedidos
│       ├── finca/              # Componentes de finca y lotes
│       ├── costos/             # Componentes de costos y jornales
│       └── chat/               # Componentes del asistente IA
└── .env.local.example          # Variables de entorno requeridas
```

---

## VARIABLES DE ENTORNO REQUERIDAS

Crear `.env.local` basado en `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
WHATSAPP_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
OPENAI_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## MODELO DE DATOS — TABLAS PRINCIPALES

El esquema completo está en `database/01_modelo_datos.sql`. Leerlo antes de escribir cualquier query.

**Entidades core:**
- `usuarios` — caficultores, almacenes, admins. Login por OTP. Campo `sector` para multi-sector futuro.
- `fincas` — ubicación GPS (PostGIS), municipio, departamento, altitud.
- `lotes` — polígonos dentro de una finca. Variedad, edad, densidad, sombrio, etapa del cultivo.
- `almacenes` — proveedores. Ubicación GPS, teléfono WhatsApp, comisión.

**Marketplace:**
- `categorias` — fertilizantes, agroquimicos, herramientas, semillas, enmiendas, bioinsumos.
- `productos` — catálogo maestro con composición NPK en JSONB.
- `precios` — precio de un producto en un almacén. Incluye origen y fecha de actualización.
- `precios_historial` — trigger automático guarda historial cuando cambia un precio.
- `pedidos` — estados: pendiente → confirmado → entregado (o rechazado/cancelado). Canal whatsapp/pwa.
- `pedido_items` — productos y cantidades de cada pedido.

**Inteligencia agronómica:**
- `analisis_suelo` — valores del laboratorio + interpretación y recomendación generada por Claude.
- `floraciones` — fecha + cálculo automático de cosecha (+8 meses), fertilización (-2 meses), broca (+120 días).

**Costos:**
- `gastos` — origen: marketplace (automático al confirmar pedido), ocr (foto de factura), manual.
- `jornales` — mano de obra: trabajador, labor, días, pago.

**Triggers ya incluidos en el SQL:**
- Número de pedido secuencial (GV-00001)
- Gasto automático cuando pedido cambia a "confirmado"
- Historial de precios cuando un precio se actualiza
- Fechas de cosecha, fertilización y broca desde la floración

**RLS (Row Level Security) ya configurado:**
- Un caficultor solo ve sus propios datos
- Un almacén solo ve los pedidos que le llegan a él

---

## ASISTENTE IA — CÓMO FUNCIONA

Ver `docs/02_system_prompt_tools.ts` para el system prompt completo y las 11 tools.

**Personalidad:** Extensionista cafetero amigable. Usa terminología cafetera colombiana. NUNCA inventa precios ni datos agronómicos.

**Tools disponibles:**
1. `buscar_productos` — busca en catálogo, devuelve con precios y distancia al caficultor
2. `comparar_precios` — compara un producto en todos los almacenes cercanos
3. `crear_pedido` — crea pedido en BD, notifica almacén por WhatsApp
4. `interpretar_analisis_suelo` — clasifica nutrientes con tablas Cenicafé, recomienda grado
5. `registrar_gasto` — registra gasto manual o desde OCR de factura
6. `consultar_costos` — resumen de costos por finca/lote/categoría/período
7. `consultar_clima` — pronóstico para la zona de la finca
8. `consultar_perfil_caficultor` — datos completos del caficultor
9. `registrar_floracion` — registra floración, calcula fechas automáticamente
10. `escalar_a_humano` — cuando no puede resolver, escala al equipo
11. `notificar_almacen` — envía WhatsApp al almacén (pedido, consulta, cancelación)

**Flujo de un mensaje WhatsApp:**
1. Meta envía webhook a `/api/whatsapp/webhook`
2. Si nota de voz → Whisper transcribe
3. Si foto → guardar en Supabase Storage
4. Enviar a Claude API con system prompt + tools + contexto del caficultor
5. Claude ejecuta tools si es necesario
6. Respuesta se envía por WhatsApp al caficultor
7. Si se creó pedido → WhatsApp al almacén

**Patrón asíncrono obligatorio para WhatsApp** (evitar timeout de Vercel):
1. Recibir webhook → responder 200 inmediatamente
2. Procesar en background (Claude, Whisper, etc.)
3. Enviar respuesta cuando esté lista

---

## FLUJOS CONVERSACIONALES

Ver `docs/03_flujos_whatsapp.md` para los 8 flujos completos.

Los más importantes:
- **Flujo 1:** Primera vez — registro del caficultor (nombre, ubicación, finca)
- **Flujo 2:** Compra de fertilizante — el flujo principal de venta
- **Flujo 4:** Foto de análisis de suelo — Claude Vision extrae, interpreta, recomienda
- **Flujo 5:** Foto de factura — extrae datos, registra gasto
- **Flujo 7:** Venta proactiva — el asistente inicia conversación (oferta, clima, fertilización, plaga)
- **Flujo 8:** Interacción con almacén — recibir pedidos, actualizar precios por foto

---

## PANTALLAS DE LA PWA

Ver `docs/04_wireframes.md` para el detalle de cada pantalla.

**Caficultor — 5 tabs:**
- Tab 1 Inicio: saludo, resumen, accesos rápidos, alertas
- Tab 2 Catálogo: búsqueda, categorías, comparador de precios, crear pedido
- Tab 3 Mi Finca: mapa satelite, lotes con polígonos, análisis de suelo, floraciones
- Tab 4 Mis Costos: resumen, gráficos, registrar gasto/factura, jornales, simulador
- Tab 5 Chat: asistente IA dentro de la PWA (mismo que WhatsApp)

**Almacén — panel web:**
- Dashboard: pedidos pendientes, ingresos del día
- Pedidos: confirmar/rechazar/cambiar precio
- Productos: editar precios, toggle disponibilidad, subir foto de lista
- Reportes: ventas, productos más pedidos

---

## PLAN DE TRABAJO — FASES Y TAREAS

### FASE 1 — Marketplace (prioridad máxima)

El objetivo es tener un flujo completo de pedido funcionando antes de cualquier otra cosa.

**Tarea 1.1 — Conexión a Supabase y Auth**
- Instalar `@supabase/supabase-js` y `@supabase/ssr`
- Ejecutar `database/01_modelo_datos.sql` en el proyecto de Supabase
- Ejecutar `database/05_datos_semilla.sql` para datos de ejemplo
- Implementar login por OTP: `/api/auth/otp` → Supabase Auth con teléfono
- Middleware de protección de rutas (caficultor vs almacén)
- Generar tipos con `supabase gen types typescript --local > src/types/supabase.ts`

**Tarea 1.2 — Catálogo de productos**
- API route `GET /api/productos` — lista con filtros por categoría y sector
- API route `GET /api/productos/buscar` — búsqueda por texto + distancia al caficultor (PostGIS)
- Página `/catalogo` — lista de productos con precio más bajo y número de almacenes
- Página `/catalogo/[id]` — detalle con comparador de precios por almacén y distancia

**Tarea 1.3 — Flujo de pedido**
- API route `POST /api/pedidos` — crear pedido, validar stock, calcular total
- API route `PATCH /api/pedidos/[id]` — confirmar/rechazar/entregar
- Página `/catalogo/pedido` — selector de almacén, cantidad, notas, resumen
- Página de confirmación con número de pedido y estado
- Supabase Realtime para actualizar estado del pedido en tiempo real

**Tarea 1.4 — Panel del almacén**
- Página `/almacen/dashboard` — pedidos pendientes (badge), ingresos del día
- Página `/almacen/pedidos` — lista con tabs: Pendientes | Confirmados | Entregados | Rechazados
- Acciones: confirmar, rechazar (con razón), cambiar precio
- Al confirmar → notificar caficultor automáticamente
- Página `/almacen/productos` — editar precio en línea, toggle disponible/agotado

**Tarea 1.5 — WhatsApp webhook**
- API route `POST /api/whatsapp/webhook` — recibir y verificar firma de Meta
- API route `GET /api/whatsapp/webhook` — verificación inicial del webhook
- Parsear tipos de mensaje: texto, audio, imagen, ubicación
- Mantener contexto de conversación con historial en tabla `conversaciones`
- Implementar tools del asistente: `buscar_productos`, `crear_pedido`, `notificar_almacen`
- Si nota de voz → transcribir con Whisper antes de enviar a Claude
- **Patrón asíncrono:** responder 200 inmediato, procesar en background

**Tarea 1.6 — Notificaciones WhatsApp**
- Función `enviarMensajeWhatsApp(telefono, mensaje)` usando la Cloud API de Meta
- Notificar al almacén cuando llega un pedido nuevo
- Notificar al caficultor cuando el almacén confirma/rechaza
- Si almacén responde SI/NO por WhatsApp → actualizar estado del pedido

---

### FASE 2 — Inteligencia agronómica

**Tarea 2.1 — Análisis de suelo**
- API route `POST /api/suelo/interpretar` — recibe valores, usa `src/lib/cenicafe/tablas.ts` para clasificar, llama a Claude para generar recomendación en texto
- Flujo WhatsApp: caficultor envía foto → Claude Vision extrae valores → interpreta → recomienda
- Página `/mi-finca/analisis` — tabla de resultados con semáforo (rojo/amarillo/verde) y recomendación
- Enlace directo recomendación → catálogo con el fertilizante sugerido

**Tarea 2.2 — Finca y lotes**
- Registro de finca con GPS (Google Maps)
- CRUD de lotes con polígonos en el mapa
- Página `/mi-finca` — mapa satelite + lista de lotes con estado y próxima acción

**Tarea 2.3 — Floraciones**
- API route `POST /api/floraciones` — registrar, calcular fechas automáticamente (DB trigger)
- Visualización en el detalle del lote: cosecha estimada, próxima fertilización, período crítico de broca
- Alertas proactivas basadas en fechas calculadas

**Tarea 2.4 — Alertas climáticas**
- Integrar API de clima (Open-Meteo es gratuita) por coordenadas de la finca
- Tool `consultar_clima` en el asistente
- Alerta proactiva si lluvia + fecha de fertilización coinciden

---

### FASE 3 — Costos y monetización

**Tarea 3.1 — Registro de costos**
- Registro automático de gasto cuando pedido cambia a "confirmado" (ya en el trigger SQL)
- OCR de facturas: foto → Claude Vision extrae datos → confirmar con caficultor → registrar en `gastos`
- Registro manual de jornales
- Página `/mis-costos` — resumen con gráficos, lista de gastos, jornales

**Tarea 3.2 — Dashboard de costos**
- Costo por hectárea vs promedio nacional
- Gráfico de barras por categoría
- Simulador de rentabilidad: precio del café vs costos acumulados

**Tarea 3.3 — Comisiones**
- Calcular comisión al confirmar pedido (`comision_porcentaje` del almacén)
- Registrar en `pedidos.comision`
- Reporte de comisiones acumuladas para el negocio

**Tarea 3.4 — Compras colectivas**
- Pools de demanda por zona: `pools_compra` + `pool_participantes`
- Caficultor se une a un pool existente o crea uno nuevo
- Notificación cuando el pool alcanza el mínimo para activarse

---

### FASE 4 — Trazabilidad EUDR y escala

**Tarea 4.1 — Pasaporte EUDR**
- Registro en `trazabilidad` por lote/cosecha
- Verificación de coordenadas GPS (no deforestación)
- Registro de buenas prácticas
- Generar certificado PDF con QR único

**Tarea 4.2 — API para exportadores**
- Endpoint autenticado para consultar trazabilidad por QR
- Panel de exportador con mapa y datos de origen

---

## REGLAS DE DESARROLLO

### TypeScript
- Estricto siempre: cero `any`, cero `as unknown`
- Usar los tipos de `src/types/database.ts` en todo el proyecto
- Regenerar tipos de Supabase con `supabase gen types typescript` cuando cambie el esquema

### Base de datos
- NUNCA modificar tablas directamente en producción — siempre usar migraciones de Supabase
- SIEMPRE usar PostGIS para consultas geoespaciales (distancia a almacenes, etc.)
- RLS activado desde el día 1 — probar que un caficultor no puede ver datos de otro

### Supabase — cuál cliente usar
- `createClient()` de `lib/supabase/client.ts` → componentes React (cliente)
- `createClient()` de `lib/supabase/server.ts` → Server Components y API routes
- `createAdminClient()` de `lib/supabase/admin.ts` → operaciones privilegiadas (webhook de WhatsApp, triggers administrativos)

### Asistente IA
- El system prompt es código: versionado en Git, con pruebas, iteración constante
- NUNCA dejar que el asistente invente datos — si no tiene info, que use una tool
- Registrar TODA interacción en `conversaciones`: pregunta, respuesta, tools usadas, tokens, costo
- Monitorear ratio de escalamiento a humano — si pasa del 15%, mejorar el prompt

### WhatsApp
- **Patrón asíncrono obligatorio** — responder 200 inmediato y procesar en background
- Guardar `whatsapp_message_id` en cada conversación para trazabilidad
- El almacén también opera por WhatsApp — tratarlo como usuario con rol `almacen`

### UI / PWA
- Interfaz ultra simple: botones grandes, iconografía clara, flujos cortos
- Español colombiano sencillo. Terminología cafetera.
- Fuente mínimo 16px. Contraste alto.
- Optimizar para redes 3G: imágenes comprimidas, cache agresivo
- Service Worker + IndexedDB para modo offline (GPS, fotos, datos pendientes)

### Git
- Commits pequeños y frecuentes en español
- Formato: `tipo: descripción` — ej: `feat: agrega flujo de pedido por WhatsApp`
- Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Rama `main` siempre desplegable
- Features en ramas separadas → Pull Request

### Seguridad
- NUNCA poner API keys en el código
- Variables de entorno en Vercel desde el día 1
- Tres entornos: development, preview (cada PR), production
- Validar firma del webhook de Meta en cada request

### Validaciones de campos — OBLIGATORIO en todo formulario y API route

| Campo | Regla cliente | Regla servidor |
|---|---|---|
| `notas` / textarea libre | `maxLength={500}`, counter visual | Rechazar si `.trim().length > 500` |
| `cantidad` | `min=1`, `max=9999`, integer | Rechazar si `< 1`, `> 9999`, o no entero |
| UUIDs (producto_id, almacen_id) | n/a | Validar con `isUuid()` antes de usar |
| Texto de búsqueda | n/a | Escapar `%` y `_` antes de `ilike` |

### Mensajes de error al usuario — OBLIGATORIO

- **NUNCA** exponer mensajes crudos de Postgres (código 23503, nombres de tablas, etc.)
- Usar `friendlyDbError(err)` de `src/lib/utils/db-errors.ts` en todo `catch` de BD
- Usar el componente `<MensajeError>` de `src/components/ui/MensajeError.tsx` para mostrar errores
  - Incluye `role="alert"` para accesibilidad
  - Incluye botón "Reintentar" opcional
- Para estados vacíos: `<MensajeVacio>` de `src/components/ui/MensajeVacio.tsx`
- Nunca mostrar stack traces, nombres de columnas, ni códigos HTTP al usuario

### Protección FK antes de INSERT en pedidos

Antes de insertar en `pedidos`, verificar siempre que `caficultor_id` existe en `public.usuarios`:
```ts
const { data: cafRow } = await supabase.from('usuarios').select('id').eq('id', caficultorId).maybeSingle()
if (!cafRow) throw new Error('Tu perfil no está listo. Cierra sesión, vuelve a entrar e intenta de nuevo.')
```
Esto previene el error crudo de FK que vería el usuario final.

### Fotos de productos

- Se almacenan en `productos.metadata.foto_url` (JSONB)
- Siempre mostrar placeholder con inicial del nombre si `foto_url` es null
- Usar `<Image>` de next/image — nunca `<img>`
- El placeholder usa colores de la paleta de diseño (verde/tierra/neutro)

### Tests negativos — OBLIGATORIO

Todo componente o servicio que:
- Hace INSERT en BD → test con FK violation → verificar mensaje amigable
- Tiene formulario → tests con valores vacíos, demasiado largos, negativos, tipo incorrecto
- Llama a una API externa → test cuando la API falla → verificar manejo de error

Los tests deben verificar que el **texto que ve el usuario** es en español y sin jerga técnica.

---

## PRINCIPIO MÁS IMPORTANTE

**Construye el flujo más simple que genere un pedido real entre un caficultor y un almacén — por WhatsApp y por la PWA. Despliégalo. Ponlo en manos de 5 caficultores. Observa. Itera.**

Los primeros 5 usuarios enseñan más que 3 meses de planificación.
