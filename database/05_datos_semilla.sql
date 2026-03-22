-- ============================================================
-- SEED DATA — GranoVivo (English schema)
-- Run AFTER database/01_modelo_datos.sql
-- Replace with real warehouse prices for pilot municipalities.
-- UI copy remains Spanish in the app; data identifiers are English.
-- ============================================================

INSERT INTO categories (id, name, sector, sort_order) VALUES
('10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizantes', 'coffee', 1),
('10000000-0000-4000-8000-000000000002'::uuid, 'Agroquimicos', 'coffee', 2),
('10000000-0000-4000-8000-000000000003'::uuid, 'Herramientas', 'coffee', 3),
('10000000-0000-4000-8000-000000000004'::uuid, 'Semillas', 'coffee', 4),
('10000000-0000-4000-8000-000000000005'::uuid, 'Enmiendas y correctivos', 'coffee', 5),
('10000000-0000-4000-8000-000000000006'::uuid, 'Bioinsumos', 'coffee', 6);

INSERT INTO products (id, category_id, name, short_name, brand, presentation, unit_of_measure, weight_kg, composition, sector) VALUES
('30000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizante compuesto 25-4-24',     '25-4-24',       NULL, 'Bulto 50kg', 'kg', 50, '{"N":25,"P":4,"K":24}', 'coffee'),
('30000000-0000-4000-8000-000000000002'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizante compuesto 23-4-20-3-4', '23-4-20-3-4',   NULL, 'Bulto 50kg', 'kg', 50, '{"N":23,"P":4,"K":20,"Mg":3,"S":4}', 'coffee'),
('30000000-0000-4000-8000-000000000003'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizante compuesto 17-6-18-2',   '17-6-18-2',     NULL, 'Bulto 50kg', 'kg', 50, '{"N":17,"P":6,"K":18,"Mg":2}', 'coffee'),
('30000000-0000-4000-8000-000000000004'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizante compuesto 15-15-15',    '15-15-15',      NULL, 'Bulto 50kg', 'kg', 50, '{"N":15,"P":15,"K":15}', 'coffee'),
('30000000-0000-4000-8000-000000000005'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Fertilizante compuesto 26-4-22',     '26-4-22',       NULL, 'Bulto 50kg', 'kg', 50, '{"N":26,"P":4,"K":22}', 'coffee'),
('30000000-0000-4000-8000-000000000006'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Urea',                              'Urea 46-0-0',    NULL, 'Bulto 50kg', 'kg', 50, '{"N":46}', 'coffee'),
('30000000-0000-4000-8000-000000000007'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'DAP (Fosfato Diamonico)',            'DAP 18-46-0',    NULL, 'Bulto 50kg', 'kg', 50, '{"N":18,"P":46}', 'coffee'),
('30000000-0000-4000-8000-000000000008'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Cloruro de Potasio',                 'KCl 0-0-60',     NULL, 'Bulto 50kg', 'kg', 50, '{"K":60}', 'coffee'),
('30000000-0000-4000-8000-000000000009'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Sulfato de Magnesio (Kieserita)',    'Kieserita',      NULL, 'Bulto 50kg', 'kg', 50, '{"Mg":25,"S":20}', 'coffee'),
('30000000-0000-4000-8000-00000000000a'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Nitrato de Potasio',                 'KNO3 13-0-46',   NULL, 'Bulto 50kg', 'kg', 50, '{"N":13,"K":46}', 'coffee'),
('30000000-0000-4000-8000-00000000000b'::uuid, '10000000-0000-4000-8000-000000000005'::uuid, 'Cal dolomitica',                     'Cal dolomitica',  NULL, 'Bulto 50kg', 'kg', 50, '{"CaO":30,"MgO":18}', 'coffee'),
('30000000-0000-4000-8000-00000000000c'::uuid, '10000000-0000-4000-8000-000000000005'::uuid, 'Cal agricola',                       'Cal agricola',    NULL, 'Bulto 50kg', 'kg', 50, '{"CaO":48}', 'coffee'),
('30000000-0000-4000-8000-00000000000d'::uuid, '10000000-0000-4000-8000-000000000005'::uuid, 'Roca fosforica',                     'Roca fosforica',  NULL, 'Bulto 50kg', 'kg', 50, '{"P":20}', 'coffee'),
('30000000-0000-4000-8000-00000000000e'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Glifosato (herbicida)',              'Glifosato',       NULL, 'Litro',     'litro', 1, '{}', 'coffee'),
('30000000-0000-4000-8000-00000000000f'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Roundup (herbicida)',                'Roundup',     'Bayer', 'Galon 4L',  'litro', 4, '{}', 'coffee'),
('30000000-0000-4000-8000-000000000010'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Oxicloruro de cobre (fungicida)',    'Oxicloruro Cu',   NULL, 'Kilo',      'kg',    1, '{}', 'coffee'),
('30000000-0000-4000-8000-000000000011'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Clorpirifos (insecticida broca)',    'Clorpirifos',     NULL, 'Litro',     'litro', 1, '{}', 'coffee'),
('30000000-0000-4000-8000-000000000012'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Beauveria bassiana (biocontrol broca)', 'Beauveria',    NULL, 'Kilo',      'kg',    1, '{}', 'coffee'),
('30000000-0000-4000-8000-000000000013'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'Fumigadora de espalda 20L',         'Fumigadora 20L',  NULL, 'Unidad',    'unidad', NULL, '{}', 'coffee'),
('30000000-0000-4000-8000-000000000014'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'Machete cafetero',                   'Machete',         NULL, 'Unidad',    'unidad', NULL, '{}', 'coffee'),
('30000000-0000-4000-8000-000000000015'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'Media luna para deshierbe',          'Media luna',      NULL, 'Unidad',    'unidad', NULL, '{}', 'coffee');

INSERT INTO warehouses (id, name, tax_id, whatsapp_phone, municipality, department, address, location, hours_text, commission_percentage) VALUES
('20000000-0000-4000-8000-000000000001'::uuid, 'Almacen El Campo',   '900123456-1', '573001234567', 'Pitalito',  'Huila', 'Cra 5 #12-34', ST_MakePoint(-76.0486, 1.8568)::geography, 'Lun-Sab 7am-5pm', 0),
('20000000-0000-4000-8000-000000000002'::uuid, 'Agro Huila',         '900234567-2', '573002345678', 'Pitalito',  'Huila', 'Cll 8 #3-21',  ST_MakePoint(-76.0510, 1.8580)::geography, 'Lun-Sab 7am-6pm', 0),
('20000000-0000-4000-8000-000000000003'::uuid, 'Insumos del Sur',    '900345678-3', '573003456789', 'Pitalito',  'Huila', 'Cra 3 #10-15', ST_MakePoint(-76.0530, 1.8600)::geography, 'Lun-Vie 8am-5pm', 0);

INSERT INTO prices (product_id, warehouse_id, unit_price, is_available, origin) VALUES
('30000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 182000, true, 'manual'),
('30000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 198000, true, 'manual'),
('30000000-0000-4000-8000-000000000006'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 165000, true, 'manual'),
('30000000-0000-4000-8000-00000000000b'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 45000,  true, 'manual'),
('30000000-0000-4000-8000-00000000000f'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 85000,  true, 'manual'),
('30000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 191000, true, 'manual'),
('30000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 205000, true, 'manual'),
('30000000-0000-4000-8000-000000000006'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 172000, true, 'manual'),
('30000000-0000-4000-8000-00000000000b'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 48000,  true, 'manual'),
('30000000-0000-4000-8000-00000000000f'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 88000,  true, 'manual'),
('30000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 195000, true, 'manual'),
('30000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 210000, true, 'manual'),
('30000000-0000-4000-8000-000000000006'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 178000, true, 'manual'),
('30000000-0000-4000-8000-00000000000b'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 46000,  true, 'manual'),
('30000000-0000-4000-8000-00000000000f'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 82000,  true, 'manual');
