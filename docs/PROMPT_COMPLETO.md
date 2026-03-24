# PROMPT DE DESARROLLO — GRANOVIVO (nombre provisional)
# Plataforma integral para caficultores colombianos
# Este documento contiene TODO el contexto necesario para construir la aplicacion

---

## CONTEXTO DEL PROYECTO

GranoVivo es una plataforma digital que permite a los caficultores colombianos comprar insumos agricolas de forma inteligente a traves de un marketplace, recibir recomendaciones agronomicas basadas en analisis de suelo, registrar sus costos de produccion, acceder a financiacion, y generar trazabilidad para el mercado internacional (EUDR).

El canal principal de interaccion es un asistente virtual de IA que funciona como vendedor y agronomo digital disponible 24/7 por WhatsApp. La PWA (app web) complementa como canal visual para consultas detalladas, mapas y dashboards. Ambos canales comparten el mismo backend y la misma base de datos.

La plataforma es gratuita para el caficultor. Los ingresos provienen de comisiones a proveedores (3-5% por pedido confirmado), fees por referido financiero, datos de trazabilidad para exportadores, y bonos de carbono.

### Usuarios
- Caficultores pequenos y medianos (1-10 hectareas) — usuario principal
- Almacenes agricolas y proveedores de insumos — publican precios, reciben pedidos
- Cooperativas de cafeteros — canal de distribucion
- Exportadores (futuro) — consultan trazabilidad EUDR

### Equipo
- 2 cofundadores: un desarrollador (que usa IA para construir) y un experto en cafe con contactos en campo
- El desarrollo esta soportado enteramente por IA (Claude)
- El socio de negocio se encarga de: conseguir datos de precios, onboarding de almacenes, onboarding de caficultores, validacion en campo

### Contexto cafetero colombiano
- Colombia tiene 500,000+ familias caficultoras. El 95% tiene menos de 5 hectareas.
- La fertilizacion representa ~20% del costo de produccion
- La mayoria de caficultores llevan costos de forma empirica (cuadernos o memoria)
- No existe una plataforma que integre compra de insumos + analisis de suelo + financiacion + costos + trazabilidad
- A partir de junio 2026, la regulacion EUDR de la UE exige trazabilidad para exportar cafe a Europa
- Los caficultores usan WhatsApp como herramienta principal de comunicacion
- En zonas rurales la conectividad es limitada (3G, a veces sin senal)

---

## STACK TECNICO

```
Frontend + Backend:  Next.js 14+ con App Router, TypeScript estricto
Base de datos:       Supabase (PostgreSQL + PostGIS + Auth + Storage + Realtime)
Hosting:             Vercel
Motor IA:            Claude API (Anthropic) — unico motor para asistente, vision, OCR, interpretacion de suelos
Canal WhatsApp:      WhatsApp Business Cloud API (Meta)
Voz a texto:         Whisper API (OpenAI)
Mapas:               Google Maps Platform (mejor cobertura satelital en zona rural colombiana)
```

### Decisiones tecnicas clave
- TypeScript en todo. Frontend y backend. Un solo lenguaje, un solo repositorio.
- Claude API como unico motor de IA. Sin Google Vision. Claude maneja vision (fotos de facturas y analisis de suelo) con mejor comprension de contexto.
- Ambos canales (WhatsApp + PWA) comparten las mismas API routes y base de datos. Una funcionalidad nueva funciona automaticamente en ambos canales.
- PWA (Progressive Web App) como primera version. Funciona en cualquier celular con navegador sin descargar de Play Store.
- El modelo de datos incluye un campo "sector" para escalabilidad futura a otros sectores (ganaderia, cacao, etc.) sin reescribir codigo.

---

## ARQUITECTURA DE ALTO NIVEL

```
[Caficultor WhatsApp] ──┐
                        ├──> [Next.js API Routes] ──> [Supabase PostgreSQL]
[Caficultor PWA]  ──────┤         │                         │
                        │    [Claude API]              [Storage (fotos)]
[Almacen WhatsApp] ─────┤    [Whisper API]             [Realtime (pedidos)]
                        │    [Google Maps]
[Almacen Panel Web] ────┘
[Admin Dashboard] ──────┘
```

### Flujo de un pedido por WhatsApp:
1. Caficultor envia mensaje a WhatsApp Business
2. Meta webhook llega a API route `/api/whatsapp/webhook`
3. Si es nota de voz: Whisper transcribe a texto
4. Si es foto: se guarda en Supabase Storage
5. El mensaje (texto o transcripcion) se envia a Claude API con el system prompt + tools + contexto del caficultor
6. Claude interpreta la intencion y ejecuta tools (buscar_productos, crear_pedido, etc.)
7. La respuesta de Claude se envia de vuelta por WhatsApp al caficultor
8. Si se crea un pedido, se notifica al almacen por WhatsApp
9. El almacen responde SI/NO por WhatsApp
10. Se notifica al caficultor del resultado

### Flujo de un pedido por PWA:
1. Caficultor navega el catalogo en la PWA
2. Selecciona producto, almacen y cantidad
3. POST a `/api/pedidos` crea el pedido en Supabase
4. Supabase Realtime notifica al panel del almacen
5. Ademas se envia WhatsApp al almacen con el pedido
6. Almacen confirma (por WhatsApp o por panel web)
7. PWA se actualiza en tiempo real con Supabase Realtime

---

## MODELO DE DATOS

El archivo `01_data_model.sql` contiene el esquema completo de 20 tablas con PostGIS. Las tablas principales son:

### Entidades core
- `usuarios` — Caficultores, almacenes, admins. Login por OTP/SMS. Campo `sector` para multi-sector.
- `fincas` — Ubicacion GPS, municipio, departamento, altitud. Relacion 1:N con usuarios.
- `lotes` — Poligonos dentro de una finca. Variedad, edad, densidad, sombrio, etapa del cultivo.
- `almacenes` — Proveedores de insumos. Ubicacion GPS, telefono WhatsApp, comision acordada.

### Marketplace
- `categorias` — Fertilizantes, agroquimicos, herramientas, semillas, enmiendas, bioinsumos.
- `productos` — Catalogo maestro con composicion NPK en JSONB.
- `precios` — Precio de un producto en un almacen. Con origen (manual, foto_whatsapp, integracion_api, referencia_sipsa) y fecha de actualizacion.
- `precios_historial` — Trigger automatico guarda historial cuando un precio cambia.
- `pedidos` — Estado: pendiente > confirmado > entregado (o rechazado/cancelado). Canal (whatsapp/pwa).
- `pedido_items` — Productos y cantidades de cada pedido.

### Inteligencia agronomica
- `analisis_suelo` — Valores del laboratorio + interpretacion y recomendacion generada por Claude.
- `floraciones` — Fecha de floracion con calculo automatico de cosecha (+8 meses), fertilizacion (-2 meses), broca critica (+120 dias).

### Costos
- `gastos` — Registro de costos. Origen: marketplace (automatico), ocr (foto de factura), manual.
- `jornales` — Mano de obra: trabajador, labor, dias, pago.

### Otros
- `alertas` — Clima, plagas, precios, fertilizacion.
- `conversaciones` — Historial completo del asistente IA con tokens usados y costo.
- `cooperativas` + `caficultor_cooperativa` — Relacion caficultor-cooperativa.
- `trazabilidad` — Pasaporte EUDR por lote.
- `precios_referencia` — Precios SIPSA/DANE como benchmark.
- `pools_compra` + `pool_participantes` — Compras colectivas.

### Triggers automaticos (ya incluidos en el SQL)
- Generar numero de pedido secuencial (GV-00001)
- Registrar gasto automaticamente cuando un pedido cambia a "confirmado"
- Guardar historial de precios cuando un precio se actualiza
- Calcular fechas de cosecha, fertilizacion y broca desde la floracion

### Row Level Security
- Un caficultor solo puede ver sus propios datos (fincas, lotes, pedidos, gastos, etc.)
- Un almacen solo puede ver los pedidos que le llegan a el

---

## SYSTEM PROMPT DEL ASISTENTE IA

El archivo `02_system_prompt_tools.ts` contiene el system prompt completo y las 11 tools. Puntos clave:

### Personalidad
- Habla como un extensionista cafetero amigable, no como un robot
- Usa terminologia cafetera: arroba, carga, bulto, pergamino seco, grados, lote, zoca
- Respuestas cortas en WhatsApp (3-4 parrafos maximo)
- Usa "Don/Dona" si el caficultor es mayor
- NUNCA inventa precios ni datos agronomicos

### Tools (funciones que Claude puede ejecutar)
1. `buscar_productos` — Busca en catalogo por nombre/categoria, devuelve con precios y distancia
2. `comparar_precios` — Compara un producto en todos los almacenes cercanos
3. `crear_pedido` — Crea pedido en BD, notifica almacen
4. `interpretar_analisis_suelo` — Recibe valores, clasifica con tablas Cenicafe, recomienda grado
5. `registrar_gasto` — Registra gasto manual o desde OCR
6. `consultar_costos` — Resumen de costos por finca/lote/categoria/periodo
7. `consultar_clima` — Pronostico 5-7 dias para la zona de la finca
8. `consultar_perfil_caficultor` — Datos completos del caficultor
9. `registrar_floracion` — Registra floracion, calcula fechas automaticamente
10. `escalar_a_humano` — Cuando no puede resolver, escala al equipo
11. `notificar_almacen` — Envia WhatsApp al almacen (pedido, consulta, cancelacion)

### Conocimiento base de Cenicafe (incluido en el prompt)
- Grado 26-4-22: suelos con Mg normal. Dosis 1,164 kg/ha/ano.
- Grado 23-4-20-3-4: suelos bajos en Mg y S. Dosis 1,300 kg/ha/ano.
- Ajustes por sombrio, densidad y etapa del cultivo.
- Niveles criticos por nutriente (tabla completa en el archivo).
- Recomendaciones de encalamiento.

---

## FLUJOS DE WHATSAPP

El archivo `03_flujos_whatsapp.md` contiene 8 flujos conversacionales completos:

1. **Primera vez** — Registro del caficultor (nombre, ubicacion GPS, finca)
2. **Compra de fertilizante** — El flujo principal de venta
3. **Almacen rechaza o cambia precio** — Manejo de excepciones
4. **Foto de analisis de suelo** — Claude Vision extrae, interpreta, recomienda, enlaza a marketplace
5. **Foto de factura** — Extrae datos, confirma con caficultor, registra gasto
6. **Nota de voz** — Whisper transcribe, Claude interpreta y responde
7. **Venta proactiva** — El asistente inicia conversacion (oferta, clima, fertilizacion, plaga)
8. **Interaccion con almacen** — Recibir pedidos, confirmar, actualizar precios por foto

### Importante: el almacen tambien opera por WhatsApp
- Recibe pedidos como mensaje y responde SI/NO
- Puede enviar foto de su lista de precios para actualizar catalogo
- Puede consultar pedidos pendientes por chat

---

## WIREFRAMES DE LA PWA

El archivo `04_wireframes.md` describe todas las pantallas:

### Caficultor (5 tabs)
- **Tab 1 Inicio**: Saludo, resumen, accesos rapidos, alertas
- **Tab 2 Catalogo**: Busqueda, categorias, lista de productos, detalle con comparador, crear pedido
- **Tab 3 Mi finca**: Mapa satelite, lotes con poligonos, analisis de suelo, floraciones
- **Tab 4 Mis costos**: Resumen, gastos por categoria, registrar gasto/factura, jornales, simulador rentabilidad
- **Tab 5 Chat**: Asistente IA dentro de la PWA (mismo que WhatsApp)

### Almacen (panel web)
- Dashboard: pedidos pendientes, del dia, ingresos
- Pedidos: lista con confirmar/rechazar/cambiar precio
- Productos: editar precios, toggle disponibilidad, subir foto de lista
- Reportes: ventas, productos mas pedidos, caficultores frecuentes

---

## DATOS SEMILLA

El archivo `05_seed_data.sql` contiene:
- 6 categorias de productos
- 22 productos reales (fertilizantes, agroquimicos, enmiendas, herramientas)
- 3 almacenes de ejemplo en Pitalito, Huila
- Precios de ejemplo (DEBEN SER REEMPLAZADOS con datos reales)
- Tablas de referencia de Cenicafe para interpretacion de suelos

---

## FASES DE CONSTRUCCION

### Fase 1 — Marketplace (semanas 1-3)
Construir en este orden:
1. Setup: monorepo Next.js + Supabase + Vercel + CI/CD
2. Modelo de datos: ejecutar SQL, configurar RLS
3. Auth: registro por telefono con OTP/SMS
4. Catalogo: productos, busqueda, comparador de precios
5. Pedidos: flujo completo caficultor > almacen > confirmacion
6. Panel almacen: recibir, confirmar, rechazar pedidos
7. WhatsApp webhook: recibir mensajes, conectar Claude, flujo de venta
8. WhatsApp almacen: pedidos por chat, actualizacion de precios por foto
9. Notificaciones: WhatsApp/SMS en cada paso del pedido

### Fase 2 — Inteligencia agronomica (semanas 4-6)
10. Analisis de suelo: subir foto, Claude Vision extrae, interpreta, recomienda
11. Enlace suelo > marketplace: recomendacion lleva al comparador
12. Georreferenciacion: registro de finca GPS, poligonos de lotes
13. Alertas climaticas: pronostico + contexto cafetero
14. Floraciones: registro con calculo automatico de fechas
15. Registro automatico de costos desde pedidos confirmados

### Fase 3 — Monetizacion (semanas 7-10)
16. Comision: calcular y registrar comision por pedido
17. OCR de facturas: foto por WhatsApp o PWA, Claude extrae datos
18. Jornales: registro de mano de obra
19. Dashboard de costos: graficos, comparacion con promedio nacional
20. Simulador de rentabilidad: precio del cafe vs costos
21. Compras colectivas: pools de demanda por zona

### Fase 4 — Trazabilidad y escala (semanas 11+)
22. Pasaporte EUDR: certificado con geo + practicas + trazabilidad
23. Codigo QR por lote/cosecha
24. API para exportadores
25. Directorio financiero por municipio
26. Historial crediticio digital del caficultor

---

## BUENAS PRACTICAS DE DESARROLLO

### Repositorio
- Monorepo: todo en un solo repositorio (frontend, backend, types, configs)
- Git desde el minuto cero. Commits pequenos y frecuentes.
- Mensajes de commit claros en espanol: "agrega flujo de pedido por WhatsApp"
- Rama `main` siempre desplegable. Features en ramas separadas.
- Nunca pushear directamente a main — siempre Pull Request, aunque seas solo tu.

### Estructura de carpetas (por dominio de negocio)
```
src/
  app/                     # Next.js App Router
    (caficultor)/          # Rutas del caficultor
      page.tsx             # Home
      catalogo/
      mi-finca/
      mis-costos/
      chat/
    (almacen)/             # Rutas del almacen
      dashboard/
      pedidos/
      productos/
    api/                   # API Routes
      whatsapp/
        webhook/route.ts   # Webhook de Meta
      pedidos/
        route.ts
        [id]/route.ts
      productos/
        route.ts
        buscar/route.ts
      suelo/
        interpretar/route.ts
      auth/
        otp/route.ts
  lib/                     # Logica compartida
    supabase/
      client.ts            # Cliente Supabase
      admin.ts             # Cliente con service role
    ai/
      assistant.ts         # System prompt + logica del asistente
      tools.ts             # Definicion de tools
      tool-handlers.ts     # Implementacion de cada tool
    whatsapp/
      client.ts            # Enviar/recibir mensajes
      flows.ts             # Logica de flujos
    cenicafe/
      tablas.ts            # Niveles criticos, recomendaciones
      interpretar.ts       # Logica de interpretacion de suelo
    utils/
      format.ts            # Formateo de precios, fechas en COP
      geo.ts               # Funciones de georreferenciacion
  types/                   # Tipos TypeScript compartidos
    database.ts            # Tipos generados de Supabase
    pedido.ts
    producto.ts
    suelo.ts
    caficultor.ts
  components/              # Componentes React compartidos
    ui/                    # Componentes base (botones, inputs, cards)
    catalogo/
    pedidos/
    finca/
    costos/
    chat/
```

### TypeScript
- Estricto: `"strict": true` en tsconfig. Cero `any`.
- Definir interfaces para cada entidad: Caficultor, Finca, Lote, Pedido, AnalisisSuelo, Producto, Precio.
- Generar tipos de Supabase con `supabase gen types typescript`.
- Los tipos se comparten entre frontend, backend y asistente IA.

### Base de datos
- Ejecutar el SQL del modelo de datos COMPLETO antes de escribir codigo de aplicacion.
- Usar migraciones de Supabase para cada cambio al esquema. NUNCA modificar tablas a mano en produccion.
- RLS activado desde el dia 1. Probar que un caficultor NO puede ver datos de otro.
- Usar PostGIS para todas las consultas geoespaciales (distancia a almacenes, etc.)

### Asistente IA
- El system prompt es codigo: versionado en Git, con pruebas, iteracion constante.
- Separar personalidad (tono, reglas) de tools (funciones ejecutables).
- Las tools tienen esquemas claros con validacion de parametros.
- NUNCA dejar que el asistente invente datos. Si no tiene informacion, que use una tool o escale.
- Registrar TODA interaccion en la tabla `conversaciones`: pregunta, respuesta, tools usadas, tokens, costo.
- Monitorear ratio de escalamiento a humano. Si pasa del 15%, mejorar el prompt.

### WhatsApp
- Patron asincrono para procesamiento pesado:
  1. Recibir mensaje
  2. Responder inmediatamente: "Recibido, dame un momento..."
  3. Procesar en background (Claude, Whisper, etc.)
  4. Enviar respuesta cuando este lista
- Esto evita timeouts de Vercel (10s en free, 60s en Pro).
- Guardar whatsapp_message_id en cada conversacion para traceabilidad.
- El almacen tambien opera por WhatsApp — tratarlo como un "usuario" mas con rol diferente.

### Variables de entorno
- NUNCA poner API keys en el codigo. Ni "temporalmente".
- Variables en Vercel desde el dia 1.
- Tres entornos: development, preview (cada PR), production.
- Cada entorno con sus propias keys.
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
WHATSAPP_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
OPENAI_API_KEY=              # Para Whisper
GOOGLE_MAPS_API_KEY=
```

### Errores y monitoreo
- Registrar todo en la tabla `conversaciones`: pregunta, respuesta, error si hubo.
- Un caficultor en una vereda NO va a reportar bugs. Debes verlo en los logs.
- Monitorear costo por usuario: tokens de Claude + llamadas a APIs.
- Alertar si un almacen no responde pedidos en mas de 2 horas.
- Vercel Analytics para metricas de la PWA.

### Testing
- Tests para rutas criticas:
  * Crear pedido: validar que se crea en BD, que llega notificacion al almacen, que se registra gasto al confirmar.
  * Interpretar suelo: validar que un suelo con potasio bajo genera recomendacion de grado correcto.
  * Buscar productos: validar que filtra por zona y ordena por precio.
- No necesitas 100% cobertura. Prioriza lo que toca dinero y datos agronomicos.

### Despliegue
- CI/CD automatico: push a main = deploy a produccion en 60 segundos (Vercel + GitHub).
- Cada Pull Request genera preview URL para que el socio valide.
- NUNCA desplegar a produccion un viernes en la noche.

### Diseno de la PWA
- Interfaz ultra simple: botones grandes, iconografia clara, flujos cortos.
- Espanol sencillo colombiano. Terminologia cafetera.
- Fuente minimo 16px. Contraste alto.
- Optimizar para redes 3G: imagenes comprimidas, cache agresivo, carga progresiva.
- Modo offline: Service Worker + IndexedDB para GPS, fotos y datos pendientes.
- La app debe poder "instalarse" en la pantalla de inicio del celular como PWA.

### Lo mas importante
No intentes construir los 60 requerimientos antes de lanzar. Construye el flujo completo mas simple que genere un pedido real entre un caficultor y un almacen — por WhatsApp y por la PWA. Despliegalo. Ponlo en manos de 5 caficultores. Observa que pasa. Itera. Los primeros 5 usuarios te ensenan mas que 3 meses de planificacion.

---

## ARCHIVOS ADJUNTOS

Este prompt viene acompanado de 5 archivos que debes usar como base:

1. `01_data_model.sql` — Esquema completo de PostgreSQL/PostGIS. Ejecutar en Supabase.
2. `02_system_prompt_tools.ts` — System prompt y definicion de 11 tools para Claude.
3. `03_flujos_whatsapp.md` — 8 flujos conversacionales completos (caficultor + almacen).
4. `04_wireframes.md` — Todas las pantallas de la PWA con contenido detallado.
5. `05_seed_data.sql` — Productos, almacenes y precios de ejemplo + tablas Cenicafe.

Empieza por el setup del proyecto (Next.js + Supabase + Vercel), ejecuta el modelo de datos, y construye el flujo de pedido completo como primera funcionalidad.
# ESPECIFICACION DE DISENO UI/UX — GRANOVIVO

Esta seccion es parte del prompt de desarrollo. Define el look and feel completo de la aplicacion.

---

## FILOSOFIA DE DISENO

GranoVivo debe sentirse como una app premium que cualquier caficultor puede usar sin instrucciones. La interfaz debe transmitir confianza, profesionalismo y conexion con el campo. No debe parecer una app de Silicon Valley ni una app gubernamental. Debe sentirse como una herramienta hecha POR gente del campo PARA gente del campo, pero con la calidad visual de una fintech moderna.

Referentes de calidad visual (estudiar estos para inspiracion, NO copiar):
- Nubank (fintech brasilena): simplicidad, claridad, un solo color dominante
- Notion: espaciado generoso, tipografia limpia, jerarquia visual clara
- Wise (Transferwise): confianza, datos claros, flujos cortos
- Rappi: familiaridad para usuarios colombianos, navegacion simple

---

## PALETA DE COLORES

Paleta tierra/cafe que conecta con el campo colombiano. Inspirada en el cafe, la tierra fertil y las hojas verdes del cafetal.

### Colores principales
```css
:root {
  /* Verde cafetal — color primario, acciones principales */
  --color-primary-50:  #F0F7F0;
  --color-primary-100: #D4E8D4;
  --color-primary-200: #A8D1A8;
  --color-primary-300: #6DB56D;
  --color-primary-400: #4A9B4A;
  --color-primary-500: #2D7A2D;  /* Boton principal, links */
  --color-primary-600: #236023;
  --color-primary-700: #1A481A;
  --color-primary-800: #123012;
  --color-primary-900: #0A1A0A;

  /* Cafe tierra — color secundario, calidez */
  --color-secondary-50:  #FAF6F1;
  --color-secondary-100: #F0E6D6;
  --color-secondary-200: #E1CCAD;
  --color-secondary-300: #C9A87A;
  --color-secondary-400: #B08850;
  --color-secondary-500: #8B6914;  /* Acentos, badges, highlights */
  --color-secondary-600: #6F5410;
  --color-secondary-700: #53400C;
  --color-secondary-800: #382B08;
  --color-secondary-900: #1C1504;

  /* Neutros calidos — fondos y textos */
  --color-neutral-50:  #FAFAF8;  /* Fondo principal */
  --color-neutral-100: #F5F3EF;  /* Fondo cards */
  --color-neutral-200: #E8E4DD;  /* Bordes suaves */
  --color-neutral-300: #D4CEC4;  /* Bordes visibles */
  --color-neutral-400: #A39E94;  /* Texto placeholder */
  --color-neutral-500: #736E64;  /* Texto secundario */
  --color-neutral-600: #524E46;  /* Texto cuerpo */
  --color-neutral-700: #3A3732;  /* Texto enfasis */
  --color-neutral-800: #252320;  /* Texto titulos */
  --color-neutral-900: #121110;  /* Texto maximo contraste */

  /* Semanticos */
  --color-success: #2D7A2D;      /* Verde primario */
  --color-warning: #D4940A;      /* Ambar cafe */
  --color-error:   #C23B22;      /* Rojo tierra */
  --color-info:    #3B7DD8;      /* Azul cielo */
}
```

### Modo oscuro
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-neutral-50:  #121110;
    --color-neutral-100: #1E1D1A;
    --color-neutral-200: #2A2825;
    --color-neutral-300: #3A3732;
    --color-neutral-600: #D4CEC4;
    --color-neutral-700: #E8E4DD;
    --color-neutral-800: #F5F3EF;
    --color-neutral-900: #FAFAF8;
    --color-primary-500: #6DB56D;
  }
}
```

### Reglas de uso de color
- Fondo principal: neutral-50 (beige muy claro, NO blanco puro)
- Cards: neutral-100 con borde neutral-200
- Boton primario: primary-500 (verde) con texto blanco
- Boton secundario: borde primary-500, fondo transparente, texto primary-500
- Links: primary-500
- Texto principal: neutral-800
- Texto secundario: neutral-500
- Precio mas bajo: primary-500 (verde) para destacar ahorro
- Precio mas alto: neutral-400 (gris) para restar importancia
- Alertas: fondo suave del color semantico (success-50, warning-50, error-50)
- Semaforo de suelo: primary-500 (bueno), secondary-500 (medio), error (bajo)

---

## TIPOGRAFIA

```css
/* Fuente principal — usar una sola familia para toda la app */
/* Recomendada: Inter (Google Fonts, gratis, moderna, legible) */
/* Alternativa: DM Sans o Outfit */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Escala de tamanos — grande para accesibilidad rural */
  --text-xs:   14px;   /* Etiquetas minimas, timestamps */
  --text-sm:   15px;   /* Texto secundario, subtitulos */
  --text-base: 17px;   /* Texto cuerpo — mas grande que lo normal para legibilidad */
  --text-lg:   19px;   /* Subtitulos de seccion */
  --text-xl:   22px;   /* Titulos de pantalla */
  --text-2xl:  28px;   /* Titulos principales, numeros grandes */
  --text-3xl:  34px;   /* Numeros hero (precio, total) */

  /* Pesos */
  --font-regular:  400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  --line-height: 1.5;
}
```

### Reglas de tipografia
- Tamano minimo: 14px. NUNCA menos. Los caficultores mayores necesitan letras grandes.
- Texto cuerpo: 17px (mas grande que el estandar de 16px) para legibilidad en campo con sol.
- Precios: siempre en --text-2xl o --text-3xl, bold, formateados con separador de miles ($182.000).
- Numeros: usar fuente tabulada (font-variant-numeric: tabular-nums) para que los precios se alineen.
- Texto en botones: 17px, semibold, en mayuscula solo la primera letra.

---

## ESPACIADO Y LAYOUT

```css
:root {
  /* Escala de espaciado — generoso para touch targets rurales */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Bordes */
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  20px;
  --radius-full: 9999px;

  /* Sombras — sutiles, calidas */
  --shadow-sm:  0 1px 2px rgba(18, 17, 16, 0.06);
  --shadow-md:  0 2px 8px rgba(18, 17, 16, 0.08);
  --shadow-lg:  0 4px 16px rgba(18, 17, 16, 0.10);
}
```

### Reglas de layout
- Padding de pantalla: 16px en movil, 24px en tablet+
- Gap entre cards: 12px
- Touch targets: minimo 56px de alto. Los dedos de un caficultor que trabaja con las manos todo el dia son grandes. Botones pequenos son inutiles.
- Cards: padding interno de 16px, border-radius 12px, sombra sutil
- Separadores: linea de 1px en neutral-200, NO usar bordes gruesos
- Contenido maximo: 480px de ancho en desktop (es una app movil-first)

---

## COMPONENTES

### Botones
```
Primario:     bg primary-500, texto blanco, radius-md, h-[56px], px-24px, semibold
              hover: primary-600
              active: primary-700, scale(0.98)
              
Secundario:   bg transparente, borde primary-500, texto primary-500, mismo tamano
              hover: bg primary-50
              
Fantasma:     bg transparente, sin borde, texto primary-500
              hover: bg neutral-100

Destructivo:  bg error, texto blanco (solo para acciones irreversibles)

TODOS los botones: 56px de alto minimo, radius-md, transicion suave (150ms)
```

### Cards
```
Card base:    bg neutral-100, border 1px neutral-200, radius-lg, padding 16px
              shadow-sm, hover: shadow-md (si es clickeable)

Card pedido:  Borde izquierdo de 3px con color segun estado:
              - pendiente: secondary-500 (cafe/ambar)
              - confirmado: primary-500 (verde)
              - rechazado: error
              - entregado: neutral-400

Card producto: Imagen (si hay) arriba, nombre bold, presentacion en text-sm,
               precio en text-2xl bold primary-500, almacen + distancia en text-sm
```

### Inputs
```
Input texto:  bg blanco, border 1px neutral-300, radius-md, h-[56px], px-16px
              focus: border primary-500, ring 2px primary-100
              placeholder: neutral-400
              label: arriba, text-sm, semibold, neutral-700

Selector:     Mismo estilo que input. Flecha a la derecha.

Busqueda:     Icono lupa a la izquierda, placeholder grande, radius-full
              bg neutral-100, border neutral-200

Cantidad (+/-): Botones grandes (48x48) con icono + y -, numero en el centro
                text-xl bold. Minimo valor: 1.
```

### Navegacion
```
Tab bar inferior (caficultor): 5 iconos con label debajo
  - Iconos: 24px, stroke, NO relleno cuando inactivo
  - Activo: icono relleno + label en primary-500
  - Inactivo: icono stroke + label en neutral-400
  - Altura total: 64px + safe area inferior
  - Fondo: blanco con sombra superior sutil

Header: Titulo de la pantalla a la izquierda (text-xl, bold)
        Acciones a la derecha (iconos 24px)
        Altura: 56px
        Fondo: neutral-50
```

### Semaforo de suelo (interpretacion de analisis)
```
Nivel bajo:    Circulo rojo (error) + texto "Bajo" + barra de progreso corta roja
Nivel medio:   Circulo ambar (secondary-500) + texto "Medio" + barra media ambar  
Nivel alto:    Circulo verde (primary-500) + texto "Alto" + barra llena verde

Mostrar como tabla con cada nutriente en una fila.
El caficultor debe entender de un vistazo que esta bien y que esta mal.
```

### Chat (asistente IA)
```
Burbuja del caficultor: bg primary-500, texto blanco, radius-lg (esquina inferior derecha cuadrada)
Burbuja del asistente:  bg neutral-100, texto neutral-800, radius-lg (esquina inferior izquierda cuadrada)
Avatar asistente:       Circulo 32px con icono de hoja/planta en primary-500
Indicador escribiendo:  3 puntos animados en burbuja gris
Input:                  Barra inferior con: clip (adjuntar) + campo texto + mic (audio) + enviar
```

### Comparador de precios
```
Tabla con filas alternadas (blanco / neutral-50)
Columnas: Almacen | Precio | Distancia | Actualizado
Precio mas bajo: texto en primary-500, bold, con badge "Mejor precio"
Los demas precios: texto normal en neutral-700
Cada fila es clickeable y lleva a crear pedido
```

### Estados vacios
```
Cuando no hay datos (sin pedidos, sin analisis, etc.):
- Ilustracion simple de lineas (no fotos, no emojis)
- Texto explicativo en neutral-500
- Boton de accion: "Hacer mi primer pedido", "Subir analisis de suelo"
NO dejar pantallas en blanco. Siempre guiar al usuario.
```

---

## ICONOGRAFIA

- Usar Lucide Icons (open source, consistente, limpio)
- Tamano: 20-24px para navegacion, 16px inline con texto
- Stroke width: 1.5px (mas fino = mas elegante)
- Color: hereda del texto (neutral-800 por defecto, primary-500 cuando activo)
- Iconos especificos sugeridos:
  * Home: house
  * Catalogo: shopping-bag
  * Finca: map-pin
  * Costos: wallet
  * Chat: message-circle
  * Buscar: search
  * Pedido: package
  * Fertilizante: beaker o flask
  * Clima: cloud-sun
  * Alerta: bell
  * WhatsApp: message-circle (no usar logo de WhatsApp por trademark)

---

## IMAGENES E ILUSTRACIONES

- NO usar fotos stock genericas de cafetales. Se ven falsas.
- Para estados vacios y onboarding: ilustraciones simples de lineas (estilo outlined)
  con colores de la paleta (primary + secondary + neutral)
- Para productos sin imagen: placeholder con icono de la categoria sobre fondo neutral-100
- Para el mapa: tiles satelitales de Google Maps. El caficultor quiere ver su finca real.

---

## ANIMACIONES Y TRANSICIONES

```css
/* Transiciones suaves en todo */
* { transition: all 150ms ease; }

/* Carga de contenido: fade in sutil */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Skeleton loading para contenido que carga */
/* Usar placeholders animados en neutral-200 con shimmer */

/* Pull to refresh en listas */
/* Boton que se presiona: scale(0.98) + sombra reducida */
/* Tab activo: transicion suave de color + peso del icono */
```

### Reglas
- Nada de animaciones largas o llamativas. El caficultor usa la app para comprar rapido, no para ver animaciones.
- Skeleton loading obligatorio para: catalogo, precios, pedidos, mapa.
- Transiciones de pantalla: fade o slide horizontal sutil (200ms max).
- Feedback tactil: todo boton debe dar feedback visual inmediato al tocarse.

---

## RESPONSIVE

La app es mobile-first. El 95% de los caficultores la usaran en celulares Android de gama media-baja.

```
Movil (default):     320px - 480px   — 1 columna, padding 16px
Tablet:              481px - 768px   — 2 columnas para catalogo, padding 24px
Desktop:             769px+          — Max 480px ancho centrado (es una app movil)
                                       Panel almacen: si usa layout completo
```

### Reglas responsive
- Disenar primero para 360px de ancho (celular Android comun en zona rural)
- Probar en: Samsung Galaxy A13 (pantalla 6.6"), Xiaomi Redmi 10 (pantalla 6.5")
- Touch targets: 56px minimo SIEMPRE. No reducir en pantallas pequenas.
- Texto: NO reducir tipografia en movil. 17px de cuerpo se mantiene.
- Imagenes de productos: aspect-ratio 1:1, max 200px, lazy loading
- Mapa: ocupa 100% del ancho, 250px de alto en movil, expandible

---

## ACCESIBILIDAD

- Contraste minimo: 4.5:1 para texto, 3:1 para iconos y bordes
- Focus visible en todos los elementos interactivos (ring de 2px primary-300)
- Etiquetas en todos los inputs (no solo placeholder)
- Alt text en todas las imagenes
- Semaforo de suelo: NO depender solo del color. Incluir texto "Bajo/Medio/Alto" y barra de progreso
- Botones con texto descriptivo, no solo iconos. "Hacer pedido" no solo un carrito
- Compatible con modo de ahorro de bateria (sin animaciones pesadas)

---

## EJEMPLO DE COMO DEBE VERSE

### Home del caficultor
```
[Header: "Hola Don Juan Carlos" + icono notificaciones]

[Card clima — fondo con gradiente sutil primary-50 a neutral-50]
  Sol parcial 24C
  "Buen dia para aplicar fertilizante"

[Card ultimo pedido — borde izquierdo verde]
  GV-00042 · Confirmado
  23 bultos 25-4-24 · Almacen El Campo
  hace 2 dias

[Card proxima accion — borde izquierdo ambar]
  Fertilizar Lote 2 en 12 dias
  Basado en tu floracion de marzo

[4 botones grandes en grid 2x2]
  [Buscar insumos]  [Mi suelo]
  [Mis costos]      [Hablar con asistente]

[Alertas deslizables horizontal]
  [Oferta: 25-4-24 bajo 8%]  [Alerta broca en tu zona]
```

### Comparador de precios
```
[Header: "Fertilizante 25-4-24" + icono atras]
[Chips: Bulto 50kg · NPK 25-4-24]

[Tabla comparadora]
  ╔══════════════════╦═══════════╦═══════╦══════════════╗
  ║ Almacen          ║ Precio    ║ Dist. ║ Actualizado  ║
  ╠══════════════════╬═══════════╬═══════╬══════════════╣
  ║ Almacen El Campo ║ $168.000  ║ 2.3km ║ hace 1 dia   ║
  ║ [MEJOR PRECIO]   ║ VERDE     ║       ║              ║
  ╠══════════════════╬═══════════╬═══════╬══════════════╣
  ║ Agro Huila       ║ $175.000  ║ 4.1km ║ hace 3 dias  ║
  ╠══════════════════╬═══════════╬═══════╬══════════════╣
  ║ Insumos del Sur  ║ $182.000  ║ 6.8km ║ hace 5 dias  ║
  ╚══════════════════╩═══════════╩═══════╩══════════════╝

[Precio referencia SIPSA: Promedio Huila $174.000]

[Grafico mini: historial 6 meses — linea con area sutil]

[Boton grande verde: "Hacer pedido"]
```

---

## ANTI-PATRONES — LO QUE NO DEBE PASAR

- NO usar fondo blanco puro (#FFFFFF). Siempre neutral-50 (beige calido).
- NO usar bordes gruesos. Maximo 1px, color neutral-200.
- NO usar sombras oscuras. Solo las definidas en el sistema (calidas, sutiles).
- NO usar mas de 2 colores fuertes en una pantalla. Primary + secondary es el maximo.
- NO usar iconos de colores variados. Todos monocromo (neutral o primary).
- NO poner texto sobre imagenes sin overlay. El contraste falla en campo con sol.
- NO usar carruseles para contenido critico. El caficultor no sabe deslizar.
- NO esconder acciones en menus hamburguesa. Todo visible, todo directo.
- NO usar modals/popups para flujos principales. Solo para confirmaciones simples.
- NO usar skeleton loading gris frio. Usar neutral-200 calido con shimmer suave.
- NO usar loading spinners genericos. Mejor skeleton o barra de progreso con contexto ("Analizando tu suelo...").
- NO dejar pantallas sin contenido. Siempre un estado vacio con accion clara.
- NO asumir que el caficultor sabe que significa un icono solo. Siempre label debajo.
