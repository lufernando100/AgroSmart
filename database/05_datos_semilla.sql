-- ============================================================
-- DATOS SEMILLA - GranoVivo
-- Ejecutar DESPUES del modelo de datos (01_modelo_datos.sql)
-- Estos son datos de ejemplo. Tu socio debe reemplazar precios
-- con datos reales de los almacenes del municipio piloto.
--
-- IDs fijos UUID (el esquema usa UUID, no slugs tipo cat-fert):
--   Categorias: 10000000-0000-4000-8000-000000000001 .. 006
--   Almacenes:  20000000-0000-4000-8000-000000000001 .. 003
--   Productos:  30000000-0000-4000-8000-000000000001 .. 015
-- ============================================================

-- ============================================================
-- CATEGORIAS
-- ============================================================
INSERT INTO categorias (id, nombre, sector, orden) VALUES
('10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizantes', 'cafe', 1),
('10000000-0000-4000-8000-000000000002'::uuid, 'Agroquimicos', 'cafe', 2),
('10000000-0000-4000-8000-000000000003'::uuid, 'Herramientas', 'cafe', 3),
('10000000-0000-4000-8000-000000000004'::uuid, 'Semillas', 'cafe', 4),
('10000000-0000-4000-8000-000000000005'::uuid, 'Enmiendas y correctivos', 'cafe', 5),
('10000000-0000-4000-8000-000000000006'::uuid, 'Bioinsumos', 'cafe', 6);

-- ============================================================
-- PRODUCTOS - FERTILIZANTES COMUNES EN CAFE
-- Los precios se cargan en la tabla "precios" por almacen
-- ============================================================
INSERT INTO productos (id, categoria_id, nombre, nombre_corto, marca, presentacion, unidad_medida, peso_kg, composicion, sector) VALUES
-- Grados compuestos recomendados por Cenicafe
('30000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizante compuesto 25-4-24',     '25-4-24',       NULL, 'Bulto 50kg', 'kg', 50, '{"N":25,"P":4,"K":24}', 'cafe'),
('30000000-0000-4000-8000-000000000002'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizante compuesto 23-4-20-3-4', '23-4-20-3-4',   NULL, 'Bulto 50kg', 'kg', 50, '{"N":23,"P":4,"K":20,"Mg":3,"S":4}', 'cafe'),
('30000000-0000-4000-8000-000000000003'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizante compuesto 17-6-18-2',   '17-6-18-2',     NULL, 'Bulto 50kg', 'kg', 50, '{"N":17,"P":6,"K":18,"Mg":2}', 'cafe'),
('30000000-0000-4000-8000-000000000004'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizante compuesto 15-15-15',    '15-15-15',      NULL, 'Bulto 50kg', 'kg', 50, '{"N":15,"P":15,"K":15}', 'cafe'),
('30000000-0000-4000-8000-000000000005'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizante compuesto 26-4-22',     '26-4-22',       NULL, 'Bulto 50kg', 'kg', 50, '{"N":26,"P":4,"K":22}', 'cafe'),

-- Fuentes simples
('30000000-0000-4000-8000-000000000006'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Urea',                              'Urea 46-0-0',    NULL, 'Bulto 50kg', 'kg', 50, '{"N":46}', 'cafe'),
('30000000-0000-4000-8000-000000000007'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'DAP (Fosfato Diamonico)',            'DAP 18-46-0',    NULL, 'Bulto 50kg', 'kg', 50, '{"N":18,"P":46}', 'cafe'),
('30000000-0000-4000-8000-000000000008'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Cloruro de Potasio',                 'KCl 0-0-60',     NULL, 'Bulto 50kg', 'kg', 50, '{"K":60}', 'cafe'),
('30000000-0000-4000-8000-000000000009'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Sulfato de Magnesio (Kieserita)',    'Kieserita',      NULL, 'Bulto 50kg', 'kg', 50, '{"Mg":25,"S":20}', 'cafe'),
('30000000-0000-4000-8000-00000000000a'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Nitrato de Potasio',                 'KNO3 13-0-46',   NULL, 'Bulto 50kg', 'kg', 50, '{"N":13,"K":46}', 'cafe'),

-- Enmiendas
('30000000-0000-4000-8000-00000000000b'::uuid, '10000000-0000-4000-8000-000000000005'::uuid, 'Cal dolomitica',                     'Cal dolomitica',  NULL, 'Bulto 50kg', 'kg', 50, '{"CaO":30,"MgO":18}', 'cafe'),
('30000000-0000-4000-8000-00000000000c'::uuid, '10000000-0000-4000-8000-000000000005'::uuid, 'Cal agricola',                       'Cal agricola',    NULL, 'Bulto 50kg', 'kg', 50, '{"CaO":48}', 'cafe'),
('30000000-0000-4000-8000-00000000000d'::uuid, '10000000-0000-4000-8000-000000000005'::uuid, 'Roca fosforica',                     'Roca fosforica',  NULL, 'Bulto 50kg', 'kg', 50, '{"P":20}', 'cafe'),

-- Agroquimicos comunes en cafe
('30000000-0000-4000-8000-00000000000e'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Glifosato (herbicida)',              'Glifosato',       NULL, 'Litro',     'litro', 1, '{}', 'cafe'),
('30000000-0000-4000-8000-00000000000f'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Roundup (herbicida)',                'Roundup',     'Bayer', 'Galon 4L',  'litro', 4, '{}', 'cafe'),
('30000000-0000-4000-8000-000000000010'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Oxicloruro de cobre (fungicida)',    'Oxicloruro Cu',   NULL, 'Kilo',      'kg',    1, '{}', 'cafe'),
('30000000-0000-4000-8000-000000000011'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Clorpirifos (insecticida broca)',    'Clorpirifos',     NULL, 'Litro',     'litro', 1, '{}', 'cafe'),
('30000000-0000-4000-8000-000000000012'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Beauveria bassiana (biocontrol broca)', 'Beauveria',    NULL, 'Kilo',      'kg',    1, '{}', 'cafe'),

-- Herramientas
('30000000-0000-4000-8000-000000000013'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'Fumigadora de espalda 20L',         'Fumigadora 20L',  NULL, 'Unidad',    'unidad', NULL, '{}', 'cafe'),
('30000000-0000-4000-8000-000000000014'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'Machete cafetero',                   'Machete',         NULL, 'Unidad',    'unidad', NULL, '{}', 'cafe'),
('30000000-0000-4000-8000-000000000015'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'Media luna para deshierbe',          'Media luna',      NULL, 'Unidad',    'unidad', NULL, '{}', 'cafe');


-- ============================================================
-- TABLAS DE REFERENCIA CENICAFE
-- Estas tablas se usan en la logica de interpretacion del
-- analisis de suelo. Se almacenan como JSON en el codigo
-- del asistente, no en la BD.
-- ============================================================

-- Este archivo documenta las tablas para referencia.
-- La implementacion real va en el system prompt y en la
-- funcion interpretar_analisis_suelo.

/*
NIVELES CRITICOS CENICAFE PARA SUELOS CAFETEROS:

| Nutriente          | Unidad   | Bajo      | Medio      | Alto      |
|--------------------|----------|-----------|------------|-----------|
| pH                 | -        | < 5.0     | 5.0 - 5.5  | > 5.5     |
| Materia organica   | %        | < 5       | 5 - 10     | > 10      |
| Fosforo (Bray II)  | mg/kg    | < 15      | 15 - 30    | > 30      |
| Potasio            | cmol/kg  | < 0.20    | 0.20-0.40  | > 0.40    |
| Calcio             | cmol/kg  | < 1.5     | 1.5 - 5.0  | > 5.0     |
| Magnesio           | cmol/kg  | < 0.5     | 0.5 - 1.5  | > 1.5     |
| Aluminio           | cmol/kg  | > 1.5 critico | 0.5-1.5 | < 0.5    |
| Azufre             | mg/kg    | < 10      | 10 - 20    | > 20      |
| Hierro             | mg/kg    | < 25      | 25 - 50    | > 50      |
| Zinc               | mg/kg    | < 2       | 2 - 5      | > 5       |
| Manganeso          | mg/kg    | < 5       | 5 - 10     | > 10      |
| Cobre              | mg/kg    | < 1       | 1 - 3      | > 3       |
| Boro               | mg/kg    | < 0.2     | 0.2 - 0.5  | > 0.5     |

RECOMENDACIONES GENERALES CENICAFE:

Grado 1: 26-4-22 (N-P-K)
  Uso: Suelos con Mg normal y composicion balanceada
  Dosis: 1,164 kg/ha/ano
  Fraccionamiento: 2 aplicaciones/ano

Grado 2: 23-4-20-3-4 (N-P-K-Mg-S)
  Uso: Suelos bajos en Mg y S
  Dosis: 1,300 kg/ha/ano
  Fraccionamiento: 2 aplicaciones/ano

AJUSTES:
- Por sombrio:
  * 0-44% sombrio: dosis completa
  * 45-55% sombrio: 50% de la dosis
  * > 55% sombrio: no fertilizar
  
- Por densidad (base 5,000 plantas/ha):
  * < 5,000: reducir proporcionalmente
  * 5,000-6,000: dosis estandar
  * > 6,000: aumentar proporcionalmente (max +20%)

- Por etapa:
  * Levante (0-18 meses): g/planta, cada 3-4 meses
    - 2 meses: 15g DAP
    - 6 meses: 25g Urea + 10g KCl
    - 10 meses: 40g Urea + 20g KCl + 10g Kieserita
    - 14 meses: 50g Urea + 30g KCl + 15g Kieserita
    - 18 meses: 60g Urea + 40g KCl + 20g Kieserita
  * Produccion: kg/ha, 2 veces/ano
  * Zoca: similar a levante pero desde mes 1 post-zoca

ENCALAMIENTO:
- Si pH < 5.0 y Al > 1.5 cmol/kg: aplicar cal
- Cal dolomitica si Mg bajo (corrige ambos)
- Cal agricola si Mg normal
- Dosis: 1,000-2,000 kg/ha segun severidad
- Aplicar 3 meses antes de fertilizar
- NO mezclar cal con fertilizante en la misma aplicacion

PRECIO CAFE PERGAMINO:
- Se consulta en tiempo real de:
  https://federaciondecafeteros.org/wp/estadisticas-cafeteras/
- Precio interno = f(Bolsa NY, Prima Colombia, Tasa de cambio)
- Factor de rendimiento promedio: 92.8
  (92.8 kg de CPS para obtener 70 kg de excelso)
*/


-- ============================================================
-- DATOS DE EJEMPLO - ALMACENES PILOTO
-- Tu socio debe reemplazar estos con almacenes reales
-- ============================================================
INSERT INTO almacenes (id, nombre, nit, telefono_whatsapp, municipio, departamento, direccion, ubicacion, horario, comision_porcentaje) VALUES
('20000000-0000-4000-8000-000000000001'::uuid, 'Almacen El Campo',   '900123456-1', '573001234567', 'Pitalito',  'Huila', 'Cra 5 #12-34', ST_MakePoint(-76.0486, 1.8568)::geography, 'Lun-Sab 7am-5pm', 0),
('20000000-0000-4000-8000-000000000002'::uuid, 'Agro Huila',         '900234567-2', '573002345678', 'Pitalito',  'Huila', 'Cll 8 #3-21',  ST_MakePoint(-76.0510, 1.8580)::geography, 'Lun-Sab 7am-6pm', 0),
('20000000-0000-4000-8000-000000000003'::uuid, 'Insumos del Sur',    '900345678-3', '573003456789', 'Pitalito',  'Huila', 'Cra 3 #10-15', ST_MakePoint(-76.0530, 1.8600)::geography, 'Lun-Vie 8am-5pm', 0);

-- ============================================================
-- PRECIOS DE EJEMPLO
-- IMPORTANTE: Tu socio debe conseguir precios REALES
-- ============================================================
INSERT INTO precios (producto_id, almacen_id, precio_unitario, disponible, origen) VALUES
-- Almacen El Campo
('30000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 182000, true, 'manual'),
('30000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 198000, true, 'manual'),
('30000000-0000-4000-8000-000000000006'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 165000, true, 'manual'),
('30000000-0000-4000-8000-00000000000b'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 45000,  true, 'manual'),
('30000000-0000-4000-8000-00000000000f'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 85000,  true, 'manual'),

-- Agro Huila
('30000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 191000, true, 'manual'),
('30000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 205000, true, 'manual'),
('30000000-0000-4000-8000-000000000006'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 172000, true, 'manual'),
('30000000-0000-4000-8000-00000000000b'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 48000,  true, 'manual'),
('30000000-0000-4000-8000-00000000000f'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 88000,  true, 'manual'),

-- Insumos del Sur
('30000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 195000, true, 'manual'),
('30000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 210000, true, 'manual'),
('30000000-0000-4000-8000-000000000006'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 178000, true, 'manual'),
('30000000-0000-4000-8000-00000000000b'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 46000,  true, 'manual'),
('30000000-0000-4000-8000-00000000000f'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 82000,  true, 'manual');
