# Flujos de conversacion WhatsApp - GranoVivo

## Flujo 1: Primera vez que un caficultor escribe

```
Caficultor: Hola
Asistente: Hola! Soy el asistente de GranoVivo. Te ayudo a encontrar
los mejores precios de insumos para tu finca y te doy recomendaciones
de fertilizacion basadas en tu suelo.

Para empezar necesito registrarte. Me dices tu nombre completo?

Caficultor: Juan Carlos Perez
Asistente: Mucho gusto Don Juan Carlos. Ahora necesito saber donde
queda tu finca para mostrarte los almacenes mas cercanos.

Puedes compartirme tu ubicacion? (Toca el clip > Ubicacion en WhatsApp)
O si prefieres, dime el municipio y vereda.

Caficultor: [Comparte ubicacion GPS]
Asistente: Perfecto, te ubico cerca de Pitalito, Huila. Listo Don Juan Carlos,
ya quedaste registrado.

Tienes 3 almacenes cerca:
- Almacen El Campo (2.3 km)
- Agro Huila (4.1 km)
- Insumos del Sur (6.8 km)

En que te puedo ayudar? Puedes pedirme cosas como:
- "Necesito fertilizante para mi cafe"
- "Comparame precios de urea"
- Enviarme la foto de tu analisis de suelo
```

## Flujo 2: Compra de fertilizante (el flujo principal)

```
Caficultor: Necesito fertilizante para mi cafe
Asistente: Claro Don Juan Carlos. Para recomendarte bien, tu cafe esta
en produccion o en levante?

Caficultor: En produccion, ya tiene 4 anos
Asistente: Perfecto. Tienes analisis de suelo reciente? Si tienes el
papel, mandame la foto y te doy la recomendacion exacta.

Si no tienes, te recomiendo el grado general de Cenicafe.

Caficultor: No tengo analisis
Asistente: Sin problema. Para cafe en produccion, Cenicafe recomienda
el grado 25-4-24 como formula general.

Para tu lote, con 5,000 plantas/ha necesitarias unos 23 bultos por
hectarea al ano (en 2 aplicaciones).

Te busco los precios:

[Ejecuta: buscar_productos("25-4-24", caficultor_id)]

Encontre 3 opciones cerca de tu finca:

1. Almacen El Campo - $182,000/bulto (2.3 km)
   Actualizado hace 1 dia

2. Agro Huila - $191,000/bulto (4.1 km)
   Actualizado hace 3 dias

3. Insumos del Sur - $195,000/bulto (6.8 km)
   Actualizado hace 5 dias

Con 23 bultos en El Campo te ahorras $299,000 vs Insumos del Sur.
Quieres que arme el pedido con El Campo?

Caficultor: Si, con El Campo, 23 bultos
Asistente: [Ejecuta: crear_pedido(...)]

Listo! Tu pedido GV-00042 quedo creado:
- 23 bultos Fertilizante 25-4-24
- Almacen El Campo, Pitalito
- Precio cotizado: $182,000/bulto
- Total estimado: $4,186,000

Ya le notifique al almacen. Te confirmo cuando acepten.

Por cierto, el jueves empieza una ventana de 4 dias sin lluvia.
Buen momento para aplicar.

---
[Al almacen por WhatsApp]

Asistente: Nuevo pedido GV-00042:
- Juan Carlos Perez, Vereda El Roble
- 23 bultos Fertilizante 25-4-24
- Precio cotizado: $182,000/bulto
- Total: $4,186,000

Responda SI para confirmar o NO para rechazar.

Almacen: SI
Asistente al caficultor: Don Juan Carlos, el Almacen El Campo confirmo
tu pedido GV-00042. Puedes pasar a recoger tus 23 bultos de 25-4-24.
Direccion: Cra 5 #12-34, Pitalito. Horario: Lun-Sab 7am-5pm.
```

## Flujo 3: Almacen rechaza o cambia precio

```
Almacen: NO, se me acabo ayer
Asistente al caficultor: Don Juan Carlos, Almacen El Campo no tiene
disponibilidad del 25-4-24 en este momento.

Pero Agro Huila si lo tiene a $191,000/bulto (4.1 km).
Son $9,000 mas por bulto ($207,000 mas en total).

Quieres que arme el pedido con Agro Huila?

---
[Alternativa: almacen cambia precio]

Almacen: SI pero el precio subio a $188,000
Asistente al caficultor: Don Juan Carlos, Almacen El Campo confirmo
disponibilidad pero el precio actual es $188,000/bulto (no $182,000).
El total seria $4,324,000.

Quieres confirmar a ese precio o prefieres que busque otra opcion?
```

## Flujo 4: Caficultor envia foto de analisis de suelo

```
Caficultor: [Envia foto del analisis de suelo]
Asistente: Recibi tu analisis de suelo. Dame un momento que lo reviso...

[Ejecuta: Claude Vision extrae valores de la foto]
[Ejecuta: interpretar_analisis_suelo(valores)]

Listo Don Juan Carlos. Tu suelo muestra esto:

pH: 4.8 (acido - necesita cal)
Materia organica: 8.2% (buena)
Fosforo: 12 mg/kg (bajo)
Potasio: 0.18 cmol/kg (bajo)
Calcio: 2.1 cmol/kg (medio)
Magnesio: 0.4 cmol/kg (bajo)
Aluminio: 1.8 cmol/kg (alto - por eso el pH acido)

Mi recomendacion para tu cafe en produccion:

1. PRIMERO: Aplicar cal dolomitica - 1,500 kg/ha
   Esto corrige la acidez y sube el magnesio.
   Aplicar 3 meses antes de fertilizar.

2. DESPUES: Fertilizante grado 23-4-20-3-4
   Como tu magnesio esta bajo, este grado lo incluye.
   Dosis: 1,300 kg/ha/ano (26 bultos), en 2 aplicaciones.

Quieres que te busque precios de la cal y del 23-4-20-3-4?

Caficultor: Si buscame los precios
Asistente: [Ejecuta: buscar_productos("cal dolomitica") y buscar_productos("23-4-20-3-4")]

Para la cal dolomitica:
- Almacen El Campo: $45,000/bulto 50kg (necesitas 30 bultos)
- Agro Huila: $48,000/bulto

Para el 23-4-20-3-4:
- Almacen El Campo: $198,000/bulto (necesitas 26 bultos)
- Agro Huila: $205,000/bulto

Total en El Campo: $1,350,000 (cal) + $5,148,000 (fertilizante) = $6,498,000
Total en Agro Huila: $1,440,000 + $5,330,000 = $6,770,000

Te ahorras $272,000 comprando todo en El Campo.
Quieres que arme los dos pedidos?
```

## Flujo 5: Caficultor envia foto de factura

```
Caficultor: [Envia foto de factura de compra]
Asistente: Recibi la factura. Dejame extraer los datos...

[Claude Vision analiza la imagen]

Estos son los datos que encontre:
- Proveedor: Almacen La Cosecha, Garzon
- Fecha: 15 de marzo 2026
- Productos:
  * 10 bultos Urea 46-0-0: $165,000 c/u = $1,650,000
  * 2 galones Roundup: $85,000 c/u = $170,000
- Total: $1,820,000

Esta correcto? Si hay algo mal, dime y lo corrijo.

Caficultor: Si, esta bien
Asistente: [Ejecuta: registrar_gasto(...)]

Registrado. Llevas $8,318,000 en insumos este semestre.
Tu costo por hectarea va en $4,159,000.

El promedio nacional segun la FNC es $3,800,000/ha.
Estas un poco por encima, principalmente por el fertilizante.

Si quieres, te muestro como optimizar en la proxima compra.
```

## Flujo 6: Nota de voz

```
Caficultor: [Nota de voz 15 segundos]: "Oiga, necesito que me ayude
con una cosa, es que yo tengo un cafe que ya tiene como 6 anos y no
se si sera hora de zoquearlo o que, porque esta paloteando mucho"

Asistente: [Whisper transcribe > Claude interpreta]

Don Juan Carlos, si tu cafe tiene 6 anos y esta paloteando (ramas
peladas, poca produccion), probablemente si es momento de renovar.

Hay dos opciones:
1. Zoca: cortas el arbol y rebrota. Mas barato pero la calidad
   puede bajar.
2. Siembra nueva: arrancas y siembras variedad Cenicafe 1
   (resistente a roya). Mas costoso pero mejor a largo plazo.

Para cualquiera de las dos necesitas saber el estado de tu suelo.
Tienes analisis reciente? Si no, te recomiendo hacerlo antes de
decidir.

Esto es algo que vale la pena hablar con el extensionista de tu
cooperativa tambien. Quieres que te conecte con el equipo para
que te orienten mejor?
```

## Flujo 7: Venta proactiva (el asistente inicia)

```
[El sistema detecta: oferta de precio]

Asistente al caficultor: Don Juan Carlos, buenas noticias.
El fertilizante 25-4-24 que compraste en febrero a $182,000
esta ahora a $168,000 en Almacen El Campo.

Eso es 8% menos. Si necesitas para la segunda aplicacion
del ano, este es buen momento.

Quieres que arme un pedido?

---
[El sistema detecta: ventana climatica + fecha de fertilizacion]

Asistente: Don Juan Carlos, segun la floracion que registraste
en marzo, la proxima semana es momento de fertilizar el lote 2.

El pronostico muestra 4 dias de sol a partir del miercoles.
Buen momento para aplicar.

Necesitas los 26 bultos de 23-4-20-3-4? Te busco el mejor
precio?

---
[El sistema detecta: alerta de plaga en la zona]

Asistente: Atencion Don Juan Carlos. Cenicafe reporto aumento de
broca en la zona de Pitalito esta semana.

Tu lote 2 tiene 130 dias desde la floracion, esta en periodo
critico. Te recomiendo revisar el porcentaje de infestacion.

Si supera el 2% con broca en posicion A o B, toca aplicar
control biologico. Quieres que te busque opciones de Beauveria
bassiana en los almacenes cercanos?
```

## Flujo 8: Interaccion con almacen

```
[Almacen quiere actualizar precios]

Almacen: [Envia foto de su lista de precios actualizada]
Asistente: Recibi su lista de precios. Dejeme actualizarla en
el sistema...

[Claude Vision extrae productos y precios]

Actualice 47 productos. Estos son los cambios principales:
- Urea 46-0-0: $165,000 > $172,000 (+4.2%)
- 25-4-24: $182,000 > $178,000 (-2.2%)
- Roundup: $85,000 (sin cambio)

Todo correcto? Si hay algun error, digame y lo corrijo.

---
[Almacen consulta sus pedidos]

Almacen: Cuantos pedidos tengo pendientes?
Asistente: Tiene 3 pedidos pendientes:
1. GV-00042 - Juan Perez - 23 bultos 25-4-24 (hace 2 horas)
2. GV-00045 - Maria Lopez - 5 galones Roundup (hace 30 min)
3. GV-00046 - Pedro Gomez - 10 bultos Urea (hace 15 min)

Quiere confirmarlos? Responda el numero del pedido + SI o NO.
```
