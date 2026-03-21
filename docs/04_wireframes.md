# Wireframes PWA - GranoVivo
# Descripcion de pantallas para implementacion

## Estructura de navegacion

La PWA tiene 2 interfaces:
1. CAFICULTOR (la principal) - 5 tabs en barra inferior
2. ALMACEN (panel) - acceso por login separado

---

## CAFICULTOR: Tab 1 - Inicio

### Pantalla: Home
- Saludo personalizado: "Hola Don Juan Carlos"
- Tarjeta resumen:
  * Ultimo pedido (estado + fecha)
  * Proximo: "Fertilizar lote 2 en 12 dias"
  * Clima hoy: icono + temperatura + "Buen dia para aplicar"
- Acceso rapido (4 botones grandes):
  * Buscar insumos
  * Mi analisis de suelo
  * Mis costos
  * Hablar con asistente
- Alertas recientes (si hay): tarjetas deslizables
  * "Oferta: 25-4-24 bajo 8% en Almacen El Campo"
  * "Alerta broca en tu zona"

---

## CAFICULTOR: Tab 2 - Catalogo / Marketplace

### Pantalla: Catalogo
- Barra de busqueda arriba (placeholder: "Busca fertilizante, urea, glifosato...")
- Categorias como chips horizontales: Fertilizantes | Agroquimicos | Herramientas | Semillas
- Lista de productos:
  * Imagen (si hay) + nombre + presentacion
  * Precio mas bajo: "$168,000 desde" en verde
  * Numero de almacenes: "en 3 almacenes cerca"
  * Distancia al mas cercano

### Pantalla: Detalle producto
- Nombre completo + marca + presentacion
- Composicion (si es fertilizante): N-P-K-Mg-S en badges
- Comparador de precios (tabla):
  | Almacen       | Precio    | Distancia | Actualizado |
  | El Campo      | $168,000  | 2.3 km    | hace 1 dia  |
  | Agro Huila    | $175,000  | 4.1 km    | hace 3 dias |
  | Insumos Sur   | $182,000  | 6.8 km    | hace 5 dias |
- Precio de referencia SIPSA (si existe): "Promedio Huila: $174,000"
- Grafico mini de historial de precios (ultimos 6 meses)
- Boton grande: "Hacer pedido" (seleccionar almacen + cantidad)

### Pantalla: Crear pedido
- Almacen seleccionado (nombre + distancia)
- Producto + precio unitario
- Selector de cantidad (+ / - con botones grandes)
- Subtotal calculado en tiempo real
- Campo de notas (opcional)
- Boton: "Confirmar pedido"
- Nota: "El almacen confirmara disponibilidad y precio final"

### Pantalla: Confirmacion de pedido
- Icono de check verde
- Numero de pedido: GV-00042
- Resumen: producto, cantidad, almacen, total estimado
- Estado: "Esperando confirmacion del almacen"
- Boton: "Ver mis pedidos"

---

## CAFICULTOR: Tab 3 - Mi finca

### Pantalla: Finca principal
- Mapa satelite con punto de la finca
- Datos: nombre, vereda, municipio, altitud, area
- Lista de lotes (tarjetas):
  * Lote 1 - Castillo, 3 anos, produccion
  * Lote 2 - Colombia, 6 anos, para renovar
- Boton: "+ Agregar lote"

### Pantalla: Detalle de lote
- Mapa con poligono del lote coloreado por estado
- Datos: variedad, edad, densidad, sombrio, area, estado
- Ultimo analisis de suelo: fecha + semaforo resumido
- Ultima floracion: fecha + "Cosecha estimada: Nov 2026"
- Proxima accion: "Fertilizar en 12 dias"
- Historial: timeline de acciones (floracion, fertilizacion, analisis)

### Pantalla: Analisis de suelo
- Si no tiene: boton grande "Subir foto de analisis"
- Si tiene: tabla de resultados con semaforo (rojo/amarillo/verde por nutriente)
- Recomendacion:
  * Grado recomendado: 23-4-20-3-4
  * Cantidad: 26 bultos/ha
  * "Tu suelo necesita cal dolomitica antes de fertilizar"
- Boton: "Ver precios de este fertilizante" (lleva al marketplace)
- Historial de analisis anteriores (si hay)

### Pantalla: Subir analisis de suelo
- Camara: tomar foto o seleccionar de galeria
- Preview de la foto
- Indicador de procesamiento: "Analizando tu suelo..."
- Resultado: tabla de valores extraidos
- Boton: "Confirmar valores" (por si la IA fallo en algo)
- Despues de confirmar: muestra interpretacion y recomendacion

---

## CAFICULTOR: Tab 4 - Mis costos

### Pantalla: Resumen de costos
- Periodo selector: Este mes | Este semestre | Este ano
- Tarjetas resumen:
  * Total gastado: $8,318,000
  * Costo por hectarea: $4,159,000
  * Promedio nacional: $3,800,000/ha
  * Margen estimado: 18% (si ya registro ventas)
- Grafico de barras: gastos por categoria
  * Fertilizantes: 62%
  * Mano de obra: 25%
  * Agroquimicos: 8%
  * Otros: 5%
- Lista de gastos recientes (scroll infinito)

### Pantalla: Registrar gasto
- Opcion 1: "Tomar foto de factura" (camara)
- Opcion 2: "Ingresar manualmente"
- Si foto: procesamiento IA > preview de datos extraidos > confirmar
- Si manual: formulario simple
  * Categoria (selector)
  * Descripcion (texto)
  * Monto (numerico, formato COP)
  * Fecha (calendario)
  * Proveedor (texto opcional)
  * Finca / Lote (selector)

### Pantalla: Jornales
- Lista de jornales registrados
- Boton: "+ Registrar jornal"
- Formulario: trabajador, labor, dias, pago/dia, fecha

### Pantalla: Simulador de rentabilidad
- Precio del cafe hoy: $X por carga (dato en vivo)
- Mis costos acumulados: $Y
- Produccion estimada: Z arrobas (ingresado por el caficultor)
- Resultado:
  * Ingreso estimado: $A
  * Costos: $B
  * Utilidad: $A - $B
  * Margen: X%
- Slider: "Si el precio sube/baja a $..." (simulacion)

---

## CAFICULTOR: Tab 5 - Chat (Asistente IA)

### Pantalla: Chat
- Interfaz tipo WhatsApp dentro de la app
- Mismo asistente que opera en WhatsApp
- Historial de conversacion persistente
- Input de texto + boton de adjuntar (foto, ubicacion) + boton de audio
- Sugerencias rapidas (chips): "Buscar fertilizante" | "Mis costos" | "Clima hoy"

---

## ALMACEN: Panel web

### Pantalla: Login almacen
- Telefono + OTP (igual que caficultor)

### Pantalla: Dashboard almacen
- Pedidos pendientes (con badge de cantidad)
- Pedidos del dia
- Ingresos del mes via GranoVivo
- Notificaciones

### Pantalla: Pedidos
- Lista con tabs: Pendientes | Confirmados | Entregados | Rechazados
- Cada pedido muestra:
  * Numero + fecha + hora
  * Caficultor (nombre + telefono)
  * Productos y cantidades
  * Total
  * Botones: Confirmar | Rechazar | Cambiar precio
- Al confirmar: se notifica al caficultor automaticamente
- Al rechazar: pide razon (agotado, precio cambio, otro)

### Pantalla: Mis productos
- Lista de productos con precio actual y stock
- Editar precio en linea (tap en el numero y cambiar)
- Toggle de disponible/agotado
- Boton: "Actualizar lista" (subir foto nueva de lista de precios)

### Pantalla: Reportes
- Ventas del mes via GranoVivo
- Productos mas pedidos
- Caficultores frecuentes
- Comparacion de precios vs competencia (anonimizado)
