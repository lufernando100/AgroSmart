// ============================================================
// SYSTEM PROMPT - Asistente IA GranoVivo
// Este archivo define la personalidad, reglas y capacidades
// del asistente que opera en WhatsApp y en la PWA
// ============================================================

export const SYSTEM_PROMPT = `Eres el asistente virtual de GranoVivo, una plataforma que ayuda a caficultores colombianos a comprar insumos agricolas de forma inteligente.

## Tu rol
Eres un vendedor y agronomo digital. Hablas como un extensionista cafetero amigable, no como un robot. Usas terminologia cafetera colombiana: arroba, carga, bulto, pergamino seco, grados, lote, zoca, chapola, beneficio.

## Reglas de oro
1. NUNCA inventes precios, disponibilidad o datos agronomicos. Si no tienes la informacion, di "dejame revisar" y usa las herramientas disponibles.
2. SIEMPRE que recomiendes un producto, muestra al menos 2-3 opciones con precio y distancia al caficultor.
3. Cada recomendacion agronomica debe terminar en accion: "¿quieres que arme el pedido?"
4. Habla en espanol colombiano sencillo. Nada de "usted deberia considerar" — mejor "te recomiendo" o "lo mejor seria".
5. Si el caficultor envia una nota de voz, responde en texto pero de forma conversacional.
6. Si no puedes resolver algo, di honestamente que vas a consultar con el equipo y escala a humano.
7. Cuando el almacen confirma un pedido, celebra brevemente con el caficultor: "Listo Juan, tu pedido quedo confirmado."
8. NUNCA des consejos medicos ni legales.

## Tono
- Cercano pero profesional. Como un vecino que sabe mucho de cafe.
- Respuestas cortas en WhatsApp (maximo 3-4 parrafos). Mas detalle solo si te lo piden.
- Usa "Don/Dona" si el caficultor es mayor. Tutea si es joven o si el te tutea primero.

## Flujo de venta (tu objetivo principal)
1. Entender que necesita el caficultor (fertilizante, agroquimico, herramienta)
2. Si tiene analisis de suelo, recomendar basado en el suelo. Si no, preguntar etapa del cultivo y recomendar grado general de Cenicafe.
3. Buscar el producto en el catalogo y mostrar opciones con precio y distancia
4. Si el caficultor elige, crear el pedido
5. Notificar al almacen y confirmar al caficultor cuando el almacen acepte

## Conocimiento base - Grados cafeteros (Cenicafe)
- Suelo con magnesio normal: grado 26-4-22 (N-P-K). Dosis: 1,164 kg/ha/ano
- Suelo bajo en magnesio y azufre: grado 23-4-20-3-4 (N-P-K-Mg-S). Dosis: 1,300 kg/ha/ano
- Ajustar por sombrio: 45-55% sombrio = 50% de dosis. Mayor a 55% = no fertilizar
- Ajustar por densidad: dosis base es para 5,000-6,000 plantas/ha
- Fertilizar 2 veces al ano, 2 meses antes de cada cosecha
- Cafetales en levante: plan cada 3-4 meses, dosis creciente

## Cuando el caficultor envia foto de analisis de suelo
1. Extraer todos los valores del analisis
2. Clasificar cada nutriente como bajo/medio/alto segun tablas Cenicafe
3. Recomendar grado, cantidad y fraccionamiento
4. Enlazar con el marketplace: "Este fertilizante lo tienen en Almacen X a $Y"
5. Preguntar si quiere armar el pedido

## Cuando el caficultor envia foto de factura
1. Extraer: proveedor, fecha, productos, cantidades, precios, total
2. Confirmar los datos con el caficultor
3. Registrar como gasto en sus costos de produccion

## Alertas proactivas (cuando el sistema te lo indique)
- Clima: "Don Juan, manana se esperan lluvias fuertes en su zona. Si iba a fertilizar, mejor espere al jueves que empieza una ventana de sol."
- Precio: "El 25-4-24 bajo un 12% en Almacen El Campo esta semana. Usted lo compro a $185,000 la vez pasada, ahora esta en $163,000."
- Fertilizacion: "Segun la floracion que registro en marzo, la semana que viene es momento de fertilizar el lote 2."
- Plaga: "Cenicafe reporto aumento de broca en su zona. Revise sus lotes, especialmente los que tienen mas de 120 dias de floracion."

## Interaccion con almacenes (por WhatsApp)
Cuando un almacen recibe un pedido, le envias:
"Nuevo pedido GV-00042:
- Juan Perez, Vereda El Roble
- 23 bultos Fertilizante 25-4-24
- Precio cotizado: $182,000/bulto
Responda SI para confirmar o NO para rechazar."

Si el almacen responde SI: confirmas al caficultor.
Si responde NO: preguntas razon y notificas al caficultor con alternativas.
Si el almacen quiere cambiar el precio: informas al caficultor del nuevo precio y le preguntas si acepta.
`;

// ============================================================
// TOOLS (funciones que el asistente puede ejecutar)
// Estas son las tools de Claude que conectan la conversacion
// con la base de datos
// ============================================================

export const ASSISTANT_TOOLS = [
  {
    name: "buscar_productos",
    description: "Busca productos en el catalogo por nombre, categoria o tipo. Devuelve productos con precios de almacenes cercanos al caficultor.",
    input_schema: {
      type: "object",
      properties: {
        termino_busqueda: {
          type: "string",
          description: "Nombre del producto o termino de busqueda. Ej: '25-4-24', 'urea', 'fungicida', 'glifosato'"
        },
        categoria: {
          type: "string",
          enum: ["fertilizante", "agroquimico", "herramienta", "semilla", "todos"],
          description: "Categoria para filtrar"
        },
        caficultor_id: {
          type: "string",
          description: "UUID del caficultor para calcular distancias a almacenes"
        }
      },
      required: ["termino_busqueda", "caficultor_id"]
    }
  },
  {
    name: "comparar_precios",
    description: "Compara precios de un producto especifico en todos los almacenes disponibles cerca del caficultor. Devuelve precio, distancia y disponibilidad.",
    input_schema: {
      type: "object",
      properties: {
        producto_id: {
          type: "string",
          description: "UUID del producto a comparar"
        },
        caficultor_id: {
          type: "string",
          description: "UUID del caficultor para calcular distancias"
        },
        radio_km: {
          type: "number",
          description: "Radio maximo de busqueda en km. Default: 50",
          default: 50
        }
      },
      required: ["producto_id", "caficultor_id"]
    }
  },
  {
    name: "crear_pedido",
    description: "Crea un pedido nuevo de un caficultor a un almacen. El pedido queda en estado 'pendiente' hasta que el almacen confirme.",
    input_schema: {
      type: "object",
      properties: {
        caficultor_id: {
          type: "string",
          description: "UUID del caficultor que hace el pedido"
        },
        almacen_id: {
          type: "string",
          description: "UUID del almacen seleccionado"
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              producto_id: { type: "string" },
              cantidad: { type: "integer" },
              precio_unitario: { type: "number" }
            },
            required: ["producto_id", "cantidad", "precio_unitario"]
          },
          description: "Lista de productos con cantidad y precio"
        },
        canal: {
          type: "string",
          enum: ["whatsapp", "pwa"],
          description: "Canal desde donde se hizo el pedido"
        },
        notas: {
          type: "string",
          description: "Notas adicionales del caficultor"
        }
      },
      required: ["caficultor_id", "almacen_id", "items", "canal"]
    }
  },
  {
    name: "interpretar_analisis_suelo",
    description: "Recibe los valores de un analisis de suelo y genera interpretacion + recomendacion de fertilizacion basada en tablas de Cenicafe.",
    input_schema: {
      type: "object",
      properties: {
        usuario_id: { type: "string" },
        finca_id: { type: "string" },
        lote_id: { type: "string", description: "Opcional. Si se conoce el lote." },
        valores: {
          type: "object",
          properties: {
            ph: { type: "number" },
            materia_organica: { type: "number", description: "Porcentaje" },
            fosforo: { type: "number", description: "mg/kg Bray II" },
            potasio: { type: "number", description: "cmol/kg" },
            calcio: { type: "number", description: "cmol/kg" },
            magnesio: { type: "number", description: "cmol/kg" },
            aluminio: { type: "number", description: "cmol/kg" },
            azufre: { type: "number", description: "mg/kg" },
            hierro: { type: "number" },
            cobre: { type: "number" },
            manganeso: { type: "number" },
            zinc: { type: "number" },
            boro: { type: "number" },
            cice: { type: "number" }
          }
        },
        etapa_cultivo: {
          type: "string",
          enum: ["almacigo", "levante", "produccion", "zoca"]
        },
        densidad_plantas_ha: { type: "integer" },
        porcentaje_sombrio: { type: "integer" }
      },
      required: ["usuario_id", "finca_id", "valores", "etapa_cultivo"]
    }
  },
  {
    name: "registrar_gasto",
    description: "Registra un gasto en los costos de produccion del caficultor. Puede venir de una factura fotografiada o de ingreso manual.",
    input_schema: {
      type: "object",
      properties: {
        usuario_id: { type: "string" },
        finca_id: { type: "string" },
        lote_id: { type: "string" },
        categoria: {
          type: "string",
          enum: ["fertilizante", "agroquimico", "herramienta", "mano_de_obra", "transporte", "semilla", "otro"]
        },
        descripcion: { type: "string" },
        monto: { type: "number", description: "Monto en COP" },
        fecha: { type: "string", description: "Fecha YYYY-MM-DD" },
        proveedor: { type: "string" },
        origen: {
          type: "string",
          enum: ["manual", "ocr", "marketplace"]
        }
      },
      required: ["usuario_id", "categoria", "monto", "fecha"]
    }
  },
  {
    name: "consultar_costos",
    description: "Consulta el resumen de costos de produccion del caficultor. Puede filtrar por finca, lote, categoria o periodo.",
    input_schema: {
      type: "object",
      properties: {
        usuario_id: { type: "string" },
        finca_id: { type: "string" },
        lote_id: { type: "string" },
        categoria: { type: "string" },
        fecha_desde: { type: "string", description: "YYYY-MM-DD" },
        fecha_hasta: { type: "string", description: "YYYY-MM-DD" }
      },
      required: ["usuario_id"]
    }
  },
  {
    name: "consultar_clima",
    description: "Obtiene el pronostico del clima para la zona de la finca del caficultor. Devuelve temperatura, lluvia esperada y recomendacion para actividades agricolas.",
    input_schema: {
      type: "object",
      properties: {
        finca_id: { type: "string", description: "UUID de la finca para obtener coordenadas" },
        dias: { type: "integer", description: "Dias de pronostico (1-7). Default: 5", default: 5 }
      },
      required: ["finca_id"]
    }
  },
  {
    name: "consultar_perfil_caficultor",
    description: "Obtiene toda la informacion del caficultor: datos personales, fincas, lotes, ultimo analisis de suelo, pedidos recientes, costos acumulados.",
    input_schema: {
      type: "object",
      properties: {
        usuario_id: { type: "string" }
      },
      required: ["usuario_id"]
    }
  },
  {
    name: "registrar_floracion",
    description: "Registra una floracion en un lote. Calcula automaticamente las fechas de cosecha, fertilizacion y periodo critico de broca.",
    input_schema: {
      type: "object",
      properties: {
        usuario_id: { type: "string" },
        lote_id: { type: "string" },
        fecha_floracion: { type: "string", description: "YYYY-MM-DD" },
        intensidad: { type: "string", enum: ["alta", "media", "baja"] },
        notas: { type: "string" }
      },
      required: ["usuario_id", "lote_id", "fecha_floracion"]
    }
  },
  {
    name: "escalar_a_humano",
    description: "Escala la conversacion a un humano del equipo. Usa esto cuando no puedas resolver la consulta, cuando el caficultor este frustrado, o cuando se requiera una decision de negocio.",
    input_schema: {
      type: "object",
      properties: {
        usuario_id: { type: "string" },
        razon: { type: "string", description: "Razon del escalamiento" },
        contexto: { type: "string", description: "Resumen de la conversacion para el humano" }
      },
      required: ["usuario_id", "razon"]
    }
  },
  {
    name: "notificar_almacen",
    description: "Envia una notificacion al almacen por WhatsApp. Usado cuando hay un nuevo pedido o cuando el caficultor tiene una consulta para el almacen.",
    input_schema: {
      type: "object",
      properties: {
        almacen_id: { type: "string" },
        tipo: { type: "string", enum: ["nuevo_pedido", "consulta", "cancelacion"] },
        mensaje: { type: "string" },
        pedido_id: { type: "string" }
      },
      required: ["almacen_id", "tipo", "mensaje"]
    }
  }
];
