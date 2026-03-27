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
