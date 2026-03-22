# Preguntas y datos por cerrar con negocio — GranoVivo / AgroSmart

Documento vivo: ir tachando o moviendo a “cerrado” cuando haya decisión o dato en mano. Objetivo: desbloquear el MVP (pedido real caficultor ↔ almacén) sin suposiciones silenciosas.

---

## 1. Piloto y alcance

- ¿Cuál es el **municipio (o zona) piloto** fija para las primeras semanas?
- ¿Cuántos **almacenes** entran al piloto (nombres, responsable de contacto)?
- ¿Cuántos **caficultores** objetivo en las primeras 4–8 semanas?
- ¿Qué cuenta como **éxito del piloto**? (ej.: N pedidos confirmados, N usuarios activos, satisfacción, ticket medio)
- ¿El piloto es **solo WhatsApp**, **solo PWA**, o **ambos desde el día uno**?

---

## 2. Catálogo, precios y stock

- ¿Quién **actualiza precios** en la práctica (almacén por panel, por WhatsApp/foto, ambos)?
- Frecuencia esperada de actualización y si hay **vigencia** de la cotización (horas/días).
- ¿Los precios semilla en `05_seed_data.sql` deben **reemplazarse** por listas reales antes de salir a usuarios? ¿Quién las entrega y en qué formato?
- ¿El **stock** es obligatorio en la app o puede quedar “disponible sí/no” sin cantidad?
- Unidades de venta: ¿siempre coherente con `unidad_medida` del producto o hay excepciones (ej. medio bulto)?
- ¿Hay productos **prohibidos** o **restringidos** (agroquímicos, dosis, edad del cultivo) que el asistente no deba ofrecer sin validación humana?

---

## 3. Pedidos, logística y pagos

- Flujo de estados: ¿coincide con **pendiente → confirmado → entregado** (y rechazado/cancelado) o falta alguno (ej. “en camino”, “listo para recoger”)?
- ¿Quién **confirma** el pedido (solo almacén por web, también por WhatsApp con SI/NO, ambos)?
- **Plazos**: tiempo máximo razonable para confirmar; qué pasa si no responden.
- **Entrega**: recoge en almacén, envío a finca, mixto. ¿Quién define costo de envío y cómo se muestra al caficultor?
- **Pago**: efectivo, transferencia, datáfono, crédito del almacén. ¿La plataforma solo informa o también registra “pagado”?
- ¿Hay **pedido mínimo** por almacén o por producto?

---

## 4. Comisiones e ingresos

- **Porcentaje de comisión** acordado por almacén (rango 3–5 % del plan vs realidad contractual).
- ¿La comisión se calcula sobre **total del pedido**, precio confirmado por almacén, o otro criterio?
- ¿Cuándo se considera **devengada** la comisión (al confirmar, al entregar, al cobrar)?
- ¿Facturación / contrato tipo con almacenes ya existe o es paralelo al desarrollo?

---

## 5. WhatsApp (Meta) y voz

- ¿Número de WhatsApp Business ya **verificado** y con línea de crédito / límites claros?
- ¿Plantillas de mensaje necesarias para **notificaciones** (pedido nuevo al almacén, confirmación al caficultor)?
- ¿Horario en que el asistente puede **escribir primero** (ofertas, recordatorios) sin molestar?
- ¿Hay **línea humana** de respaldo (teléfono, horario, quién)? ¿Cuándo debe escalar el bot?
- Uso de **notas de voz**: ¿prioridad en el piloto o puede ir en segunda fase?

---

## 6. Registro, identidad y roles

- ¿**Caficultor** siempre se registra solo con **celular + OTP** o hace falta cédula / Cédula Cafetera en el primer login?
- ¿Cómo entra un **almacén** al sistema (invitación, registro propio, alta manual interna)?
- ¿Un mismo número puede ser caficultor y luego almacén, o son cuentas separadas por política?
- ¿Cooperativas en el piloto o quedan fuera del MVP?

---

## 7. Datos, privacidad y riesgo

- Responsable de **tratamiento de datos** (nombre legal, contacto).
- Textos legales: ¿existen **Términos** y **Política de privacidad** a enlazar en la PWA?
- Ubicación de finca (GPS): ¿obligatoria para usar catálogo con distancia o puede comprar sin GPS al inicio?
- Retención de **conversaciones** y **facturas** (OCR): plazo y quién puede borrar datos.

---

## 8. Integraciones y costos operativos

- **SMS para OTP**: proveedor preferido (Twilio, MessageBird, otro) y presupuesto mensual aproximado para el piloto.
- **Claude / OpenAI**: ¿límites de gasto mensual o alertas que deba disparar el equipo?
- **Mapas**: ¿Google Maps es obligatorio desde el piloto o se acepta alternativa (solo texto de municipio al inicio)?

---

## 9. Prioridad para no bloquear desarrollo

Orden sugerido de cierre (ajustar con negocio):

1. Municipio piloto + lista de almacenes reales + contacto WhatsApp por almacén.  
2. Regla de pedido (confirmación, plazo, entrega, pago a nivel “qué prometemos en pantalla”).  
3. Comisión y si el MVP solo **registra** comisión o también **cobrará** después.  
4. OTP/SMS y número WhatsApp listos en entorno de prueba y producción.  
5. Legal mínimo (enlace a términos / aviso de datos) antes de usuarios externos.

---

## Cómo usar este archivo

- En cada reunión, asignar **dueño** y **fecha** a las preguntas abiertas.
- Lo que quede decidido: una línea en `PLAN.md` (notas) o en el contrato/correo de referencia, no solo verbal.
