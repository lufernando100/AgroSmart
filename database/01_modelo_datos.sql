-- ============================================================
-- GRANOVIVO (nombre provisional) - Modelo de datos completo
-- Supabase / PostgreSQL
-- Ejecutar en orden - las tablas tienen dependencias
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- Para georreferenciacion

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE sector_tipo AS ENUM ('cafe', 'ganaderia', 'cacao', 'otro');
CREATE TYPE usuario_rol AS ENUM ('caficultor', 'almacen', 'admin', 'cooperativa');
CREATE TYPE pedido_estado AS ENUM ('pendiente', 'confirmado', 'rechazado', 'entregado', 'cancelado');
CREATE TYPE precio_origen AS ENUM ('manual', 'foto_whatsapp', 'integracion_api', 'referencia_sipsa');
CREATE TYPE gasto_categoria AS ENUM ('fertilizante', 'agroquimico', 'herramienta', 'mano_de_obra', 'transporte', 'semilla', 'otro');
CREATE TYPE cultivo_etapa AS ENUM ('almacigo', 'levante', 'produccion', 'zoca');
CREATE TYPE lote_estado AS ENUM ('recien_sembrado', 'en_produccion', 'para_renovar', 'renovado');
CREATE TYPE alerta_tipo AS ENUM ('clima', 'plaga', 'precio', 'fertilizacion', 'cosecha', 'general');
CREATE TYPE conversacion_canal AS ENUM ('whatsapp', 'pwa');
CREATE TYPE nutriente_nivel AS ENUM ('bajo', 'medio', 'alto');

-- ============================================================
-- 1. USUARIOS (base para caficultores, almacenes, admins)
-- ============================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telefono VARCHAR(15) UNIQUE NOT NULL,  -- Login por OTP
    nombre VARCHAR(200) NOT NULL,
    cedula VARCHAR(20),
    cedula_cafetera VARCHAR(20),
    rol usuario_rol NOT NULL DEFAULT 'caficultor',
    sector sector_tipo NOT NULL DEFAULT 'cafe',
    avatar_url TEXT,
    activo BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',  -- Datos flexibles por sector
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usuarios_telefono ON usuarios(telefono);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_sector ON usuarios(sector);

-- ============================================================
-- 2. FINCAS
-- ============================================================
CREATE TABLE fincas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    vereda VARCHAR(200),
    municipio VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    altitud_msnm INTEGER,
    ubicacion GEOGRAPHY(POINT, 4326),  -- PostGIS punto GPS
    area_total_ha DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fincas_usuario ON fincas(usuario_id);
CREATE INDEX idx_fincas_ubicacion ON fincas USING GIST(ubicacion);
CREATE INDEX idx_fincas_departamento ON fincas(departamento);

-- ============================================================
-- 3. LOTES (dentro de una finca)
-- ============================================================
CREATE TABLE lotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finca_id UUID NOT NULL REFERENCES fincas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,  -- "Lote 1", "El Naranjo"
    variedad VARCHAR(100),  -- Castillo, Caturra, Colombia, etc.
    edad_anios DECIMAL(4,1),
    densidad_plantas_ha INTEGER,
    porcentaje_sombrio INTEGER CHECK (porcentaje_sombrio >= 0 AND porcentaje_sombrio <= 100),
    area_ha DECIMAL(10,2),
    estado lote_estado DEFAULT 'en_produccion',
    poligono GEOGRAPHY(POLYGON, 4326),  -- Perimetro del lote
    etapa cultivo_etapa DEFAULT 'produccion',
    ultima_floracion DATE,
    fecha_estimada_cosecha DATE,  -- Calculada: floracion + 8 meses
    fecha_fertilizacion DATE,  -- Calculada: cosecha - 2 meses
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lotes_finca ON lotes(finca_id);

-- ============================================================
-- 4. ALMACENES (proveedores de insumos)
-- ============================================================
CREATE TABLE almacenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),  -- El dueno como usuario
    nombre VARCHAR(200) NOT NULL,
    nit VARCHAR(20),
    telefono_whatsapp VARCHAR(15),  -- Para recibir pedidos
    email VARCHAR(200),
    municipio VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    direccion TEXT,
    ubicacion GEOGRAPHY(POINT, 4326),
    horario TEXT,
    acepta_pedidos_digitales BOOLEAN DEFAULT true,
    comision_porcentaje DECIMAL(4,2) DEFAULT 0,  -- Comision acordada
    activo BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_almacenes_ubicacion ON almacenes USING GIST(ubicacion);
CREATE INDEX idx_almacenes_departamento ON almacenes(departamento);
CREATE INDEX idx_almacenes_municipio ON almacenes(municipio);

-- ============================================================
-- 5. CATEGORIAS DE PRODUCTOS
-- ============================================================
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,  -- Fertilizantes, Agroquimicos, Herramientas
    sector sector_tipo NOT NULL DEFAULT 'cafe',
    icono VARCHAR(50),
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true
);

-- ============================================================
-- 6. PRODUCTOS (catalogo maestro)
-- ============================================================
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID REFERENCES categorias(id),
    nombre VARCHAR(300) NOT NULL,  -- "Fertilizante 25-4-24"
    nombre_corto VARCHAR(100),  -- "25-4-24"
    marca VARCHAR(100),
    presentacion VARCHAR(100),  -- "Bulto 50kg", "Litro", "Galon"
    unidad_medida VARCHAR(20) NOT NULL,  -- kg, litro, unidad
    peso_kg DECIMAL(10,2),
    composicion JSONB,  -- {"N": 25, "P": 4, "K": 24, "Mg": 0, "S": 0}
    descripcion TEXT,
    imagen_url TEXT,
    sector sector_tipo NOT NULL DEFAULT 'cafe',
    activo BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_nombre ON productos USING GIN(to_tsvector('spanish', nombre));
CREATE INDEX idx_productos_sector ON productos(sector);

-- ============================================================
-- 7. PRECIOS (un producto en un almacen)
-- ============================================================
CREATE TABLE precios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id),
    almacen_id UUID NOT NULL REFERENCES almacenes(id),
    precio_unitario DECIMAL(12,2) NOT NULL,  -- En COP
    precio_por_kg_nutriente DECIMAL(12,2),  -- Calculado
    disponible BOOLEAN DEFAULT true,
    stock_cantidad INTEGER,  -- NULL = no informado
    origen precio_origen NOT NULL DEFAULT 'manual',
    vigente_hasta TIMESTAMPTZ,  -- Vigencia de la cotizacion
    actualizado_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(producto_id, almacen_id)
);

CREATE INDEX idx_precios_producto ON precios(producto_id);
CREATE INDEX idx_precios_almacen ON precios(almacen_id);
CREATE INDEX idx_precios_actualizado ON precios(actualizado_at);

-- ============================================================
-- 8. HISTORIAL DE PRECIOS
-- ============================================================
CREATE TABLE precios_historial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id),
    almacen_id UUID NOT NULL REFERENCES almacenes(id),
    precio_unitario DECIMAL(12,2) NOT NULL,
    origen precio_origen NOT NULL,
    registrado_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_precios_hist_producto ON precios_historial(producto_id, registrado_at);

-- ============================================================
-- 9. PEDIDOS
-- ============================================================
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(20) UNIQUE NOT NULL,  -- GV-0001, GV-0002
    caficultor_id UUID NOT NULL REFERENCES usuarios(id),
    almacen_id UUID NOT NULL REFERENCES almacenes(id),
    estado pedido_estado DEFAULT 'pendiente',
    canal conversacion_canal NOT NULL,  -- whatsapp o pwa
    subtotal DECIMAL(12,2) NOT NULL,
    comision DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    precio_confirmado_almacen DECIMAL(12,2),  -- Precio final confirmado
    notas TEXT,
    notas_almacen TEXT,  -- Razon de rechazo, comentarios
    confirmado_at TIMESTAMPTZ,
    entregado_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pedidos_caficultor ON pedidos(caficultor_id);
CREATE INDEX idx_pedidos_almacen ON pedidos(almacen_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(created_at);

-- Secuencia para numeros de pedido
CREATE SEQUENCE pedido_numero_seq START 1;

-- ============================================================
-- 10. ITEMS DEL PEDIDO
-- ============================================================
CREATE TABLE pedido_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(12,2) NOT NULL,  -- Precio al momento del pedido
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pedido_items_pedido ON pedido_items(pedido_id);

-- ============================================================
-- 11. ANALISIS DE SUELO
-- ============================================================
CREATE TABLE analisis_suelo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lote_id UUID REFERENCES lotes(id),
    finca_id UUID NOT NULL REFERENCES fincas(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    laboratorio VARCHAR(200),
    fecha_analisis DATE,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    imagen_url TEXT,  -- Foto del resultado
    canal conversacion_canal,  -- Por donde se subio

    -- Valores del analisis
    ph DECIMAL(4,2),
    materia_organica DECIMAL(6,2),  -- Porcentaje
    nitrogeno DECIMAL(8,2),
    fosforo DECIMAL(8,2),  -- mg/kg (Bray II)
    potasio DECIMAL(8,2),  -- cmol/kg
    calcio DECIMAL(8,2),  -- cmol/kg
    magnesio DECIMAL(8,2),  -- cmol/kg
    aluminio DECIMAL(8,2),  -- cmol/kg
    sodio DECIMAL(8,2),
    azufre DECIMAL(8,2),  -- mg/kg
    hierro DECIMAL(8,2),
    cobre DECIMAL(8,2),
    manganeso DECIMAL(8,2),
    zinc DECIMAL(8,2),
    boro DECIMAL(8,2),
    cice DECIMAL(8,2),  -- Capacidad intercambio cationico
    conductividad_electrica DECIMAL(8,2),

    -- Interpretacion (generada por IA)
    interpretacion JSONB,  -- {"ph": "acido", "fosforo": "bajo", "potasio": "medio", ...}
    recomendacion JSONB,  -- {"grado": "25-4-24", "kg_ha": 1164, "fraccionamiento": 2, ...}
    recomendacion_texto TEXT,  -- Explicacion en lenguaje sencillo

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analisis_usuario ON analisis_suelo(usuario_id);
CREATE INDEX idx_analisis_finca ON analisis_suelo(finca_id);
CREATE INDEX idx_analisis_lote ON analisis_suelo(lote_id);

-- ============================================================
-- 12. GASTOS (costos de produccion)
-- ============================================================
CREATE TABLE gastos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    finca_id UUID REFERENCES fincas(id),
    lote_id UUID REFERENCES lotes(id),
    pedido_id UUID REFERENCES pedidos(id),  -- Si viene del marketplace
    categoria gasto_categoria NOT NULL,
    descripcion VARCHAR(300),
    monto DECIMAL(12,2) NOT NULL,
    fecha DATE NOT NULL,
    proveedor VARCHAR(200),
    factura_imagen_url TEXT,
    factura_datos JSONB,  -- Datos extraidos por IA de la foto
    origen VARCHAR(20) DEFAULT 'manual',  -- 'marketplace', 'ocr', 'manual'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gastos_usuario ON gastos(usuario_id);
CREATE INDEX idx_gastos_finca ON gastos(finca_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);

-- ============================================================
-- 13. JORNALES (mano de obra)
-- ============================================================
CREATE TABLE jornales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    finca_id UUID REFERENCES fincas(id),
    lote_id UUID REFERENCES lotes(id),
    trabajador_nombre VARCHAR(200) NOT NULL,
    labor VARCHAR(100) NOT NULL,  -- Recoleccion, fertilizacion, fumigacion, poda, etc.
    dias DECIMAL(4,1) NOT NULL,
    pago_por_dia DECIMAL(10,2) NOT NULL,
    pago_total DECIMAL(12,2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jornales_usuario ON jornales(usuario_id);
CREATE INDEX idx_jornales_fecha ON jornales(fecha_inicio);

-- ============================================================
-- 14. FLORACIONES
-- ============================================================
CREATE TABLE floraciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lote_id UUID NOT NULL REFERENCES lotes(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    fecha_floracion DATE NOT NULL,
    intensidad VARCHAR(20),  -- alta, media, baja
    imagen_url TEXT,
    fecha_estimada_cosecha DATE,  -- floracion + 8 meses
    fecha_fertilizacion DATE,  -- cosecha - 2 meses
    periodo_critico_broca_inicio DATE,  -- floracion + 120 dias (o 90 segun zona)
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_floraciones_lote ON floraciones(lote_id);
CREATE INDEX idx_floraciones_fecha ON floraciones(fecha_floracion);

-- ============================================================
-- 15. ALERTAS
-- ============================================================
CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo alerta_tipo NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    datos JSONB,  -- Datos estructurados de la alerta
    enviada_por conversacion_canal,
    leida BOOLEAN DEFAULT false,
    enviada_at TIMESTAMPTZ DEFAULT NOW(),
    leida_at TIMESTAMPTZ
);

CREATE INDEX idx_alertas_usuario ON alertas(usuario_id);
CREATE INDEX idx_alertas_tipo ON alertas(tipo);
CREATE INDEX idx_alertas_leida ON alertas(usuario_id, leida);

-- ============================================================
-- 16. CONVERSACIONES (historial del asistente IA)
-- ============================================================
CREATE TABLE conversaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    canal conversacion_canal NOT NULL,
    whatsapp_message_id VARCHAR(100),  -- ID de Meta
    rol VARCHAR(20) NOT NULL,  -- 'user', 'assistant', 'system'
    contenido TEXT NOT NULL,
    contenido_tipo VARCHAR(20) DEFAULT 'texto',  -- texto, imagen, audio, ubicacion
    imagen_url TEXT,
    audio_url TEXT,
    transcripcion TEXT,  -- Si fue nota de voz
    tools_usadas JSONB,  -- Que funciones ejecuto el asistente
    tokens_input INTEGER,
    tokens_output INTEGER,
    costo_estimado DECIMAL(8,4),  -- USD
    escalado_a_humano BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversaciones_usuario ON conversaciones(usuario_id, created_at);
CREATE INDEX idx_conversaciones_canal ON conversaciones(canal);
CREATE INDEX idx_conversaciones_escalado ON conversaciones(escalado_a_humano) WHERE escalado_a_humano = true;

-- ============================================================
-- 17. COOPERATIVAS
-- ============================================================
CREATE TABLE cooperativas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(200) NOT NULL,
    nit VARCHAR(20),
    municipio VARCHAR(100),
    departamento VARCHAR(100),
    contacto_nombre VARCHAR(200),
    contacto_telefono VARCHAR(15),
    numero_asociados INTEGER,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relacion caficultor <-> cooperativa
CREATE TABLE caficultor_cooperativa (
    caficultor_id UUID REFERENCES usuarios(id),
    cooperativa_id UUID REFERENCES cooperativas(id),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (caficultor_id, cooperativa_id)
);

-- ============================================================
-- 18. TRAZABILIDAD EUDR
-- ============================================================
CREATE TABLE trazabilidad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lote_id UUID NOT NULL REFERENCES lotes(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    periodo_cosecha VARCHAR(20),  -- "2026-A", "2026-B"
    coordenadas_verificadas BOOLEAN DEFAULT false,
    deforestacion_verificada BOOLEAN DEFAULT false,
    fecha_verificacion_satelital DATE,
    buenas_practicas JSONB,  -- {"fertilizacion_tecnica": true, "manejo_plagas": true, ...}
    certificado_url TEXT,
    qr_code TEXT,  -- Codigo QR unico
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trazabilidad_lote ON trazabilidad(lote_id);
CREATE INDEX idx_trazabilidad_qr ON trazabilidad(qr_code);

-- ============================================================
-- 19. PRECIOS DE REFERENCIA SIPSA
-- ============================================================
CREATE TABLE precios_referencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_nombre VARCHAR(300) NOT NULL,
    departamento VARCHAR(100),
    precio_promedio DECIMAL(12,2),
    precio_minimo DECIMAL(12,2),
    precio_maximo DECIMAL(12,2),
    fuente VARCHAR(50) DEFAULT 'SIPSA',
    fecha_reporte DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_precios_ref_producto ON precios_referencia(producto_nombre, fecha_reporte);
CREATE INDEX idx_precios_ref_depto ON precios_referencia(departamento);

-- ============================================================
-- 20. COMPRAS COLECTIVAS (pools de demanda)
-- ============================================================
CREATE TABLE pools_compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id),
    municipio VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    cantidad_total INTEGER DEFAULT 0,
    cantidad_minima INTEGER NOT NULL,  -- Minimo para activar
    precio_objetivo DECIMAL(12,2),  -- Precio negociado por volumen
    fecha_limite TIMESTAMPTZ NOT NULL,
    estado VARCHAR(20) DEFAULT 'abierto',  -- abierto, cerrado, completado, cancelado
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pool_participantes (
    pool_id UUID REFERENCES pools_compra(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id),
    cantidad INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (pool_id, usuario_id)
);

-- ============================================================
-- FUNCIONES AUXILIARES
-- ============================================================

-- Calcular distancia entre caficultor y almacen en km
CREATE OR REPLACE FUNCTION distancia_km(punto1 GEOGRAPHY, punto2 GEOGRAPHY)
RETURNS DECIMAL AS $$
    SELECT ROUND((ST_Distance(punto1, punto2) / 1000)::NUMERIC, 1);
$$ LANGUAGE SQL IMMUTABLE;

-- Generar numero de pedido
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero := 'GV-' || LPAD(nextval('pedido_numero_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_pedido_numero
    BEFORE INSERT ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION generar_numero_pedido();

-- Auto-registrar gasto cuando se confirma un pedido
CREATE OR REPLACE FUNCTION registrar_gasto_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'confirmado' AND OLD.estado = 'pendiente' THEN
        INSERT INTO gastos (usuario_id, pedido_id, categoria, descripcion, monto, fecha, proveedor, origen)
        SELECT
            NEW.caficultor_id,
            NEW.id,
            'fertilizante',  -- Default, se puede ajustar
            'Pedido ' || NEW.numero,
            COALESCE(NEW.precio_confirmado_almacen, NEW.total),
            CURRENT_DATE,
            a.nombre,
            'marketplace'
        FROM almacenes a WHERE a.id = NEW.almacen_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_gasto_automatico
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_gasto_pedido();

-- Guardar historial de precios cuando cambian
CREATE OR REPLACE FUNCTION guardar_precio_historial()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.precio_unitario IS DISTINCT FROM NEW.precio_unitario THEN
        INSERT INTO precios_historial (producto_id, almacen_id, precio_unitario, origen)
        VALUES (NEW.producto_id, NEW.almacen_id, NEW.precio_unitario, NEW.origen);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_precio_historial
    AFTER UPDATE ON precios
    FOR EACH ROW
    EXECUTE FUNCTION guardar_precio_historial();

-- Calcular fechas desde floracion
CREATE OR REPLACE FUNCTION calcular_fechas_floracion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_estimada_cosecha := NEW.fecha_floracion + INTERVAL '8 months';
    NEW.fecha_fertilizacion := NEW.fecha_estimada_cosecha - INTERVAL '2 months';
    NEW.periodo_critico_broca_inicio := NEW.fecha_floracion + INTERVAL '120 days';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_floracion_fechas
    BEFORE INSERT OR UPDATE ON floraciones
    FOR EACH ROW
    EXECUTE FUNCTION calcular_fechas_floracion();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Un caficultor solo ve sus datos, un almacen solo sus pedidos
-- ============================================================

ALTER TABLE fincas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analisis_suelo ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE jornales ENABLE ROW LEVEL SECURITY;
ALTER TABLE floraciones ENABLE ROW LEVEL SECURITY;

-- Politicas para caficultores (ven solo sus datos)
CREATE POLICY "caficultor_fincas" ON fincas FOR ALL USING (usuario_id = auth.uid());
CREATE POLICY "caficultor_lotes" ON lotes FOR ALL USING (finca_id IN (SELECT id FROM fincas WHERE usuario_id = auth.uid()));
CREATE POLICY "caficultor_pedidos" ON pedidos FOR ALL USING (caficultor_id = auth.uid());
CREATE POLICY "caficultor_gastos" ON gastos FOR ALL USING (usuario_id = auth.uid());
CREATE POLICY "caficultor_suelo" ON analisis_suelo FOR ALL USING (usuario_id = auth.uid());
CREATE POLICY "caficultor_conversaciones" ON conversaciones FOR ALL USING (usuario_id = auth.uid());
CREATE POLICY "caficultor_alertas" ON alertas FOR ALL USING (usuario_id = auth.uid());
CREATE POLICY "caficultor_jornales" ON jornales FOR ALL USING (usuario_id = auth.uid());
CREATE POLICY "caficultor_floraciones" ON floraciones FOR ALL USING (usuario_id = auth.uid());

-- Politicas para almacenes (ven sus pedidos)
CREATE POLICY "almacen_pedidos" ON pedidos FOR ALL USING (almacen_id IN (SELECT id FROM almacenes WHERE usuario_id = auth.uid()));
