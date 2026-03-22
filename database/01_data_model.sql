-- ============================================================
-- GranoVivo — full data model (English identifiers)
-- Supabase / PostgreSQL — run scripts in dependency order
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE sector_type AS ENUM ('coffee', 'livestock', 'cocoa', 'other');
CREATE TYPE user_role AS ENUM ('farmer', 'warehouse', 'admin', 'cooperative');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'rejected', 'delivered', 'cancelled');
CREATE TYPE price_origin AS ENUM ('manual', 'whatsapp_photo', 'api_integration', 'sipsa_reference');
CREATE TYPE expense_category AS ENUM ('fertilizer', 'agrochemical', 'tool', 'labor', 'transport', 'seed', 'other');
CREATE TYPE crop_stage AS ENUM ('nursery', 'establishment', 'production', 'stump');
CREATE TYPE plot_status AS ENUM ('newly_planted', 'in_production', 'due_for_renewal', 'renewed');
CREATE TYPE alert_type AS ENUM ('weather', 'pest', 'price', 'fertilization', 'harvest', 'general');
CREATE TYPE channel AS ENUM ('whatsapp', 'pwa');
CREATE TYPE nutrient_level AS ENUM ('low', 'medium', 'high');

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    national_id VARCHAR(20),
    coffee_registry_id VARCHAR(20),
    role user_role NOT NULL DEFAULT 'farmer',
    sector sector_type NOT NULL DEFAULT 'coffee',
    avatar_url TEXT,
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_sector ON users(sector);

-- ============================================================
-- 2. FARMS
-- ============================================================
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    vereda VARCHAR(200),
    municipality VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    altitude_masl INTEGER,
    location GEOGRAPHY(POINT, 4326),
    total_area_ha DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_farms_user ON farms(user_id);
CREATE INDEX idx_farms_location ON farms USING GIST(location);
CREATE INDEX idx_farms_department ON farms(department);

-- ============================================================
-- 3. PLOTS (coffee lots)
-- ============================================================
CREATE TABLE plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    age_years DECIMAL(4,1),
    plant_density_per_ha INTEGER,
    shade_percentage INTEGER CHECK (shade_percentage >= 0 AND shade_percentage <= 100),
    area_ha DECIMAL(10,2),
    status plot_status DEFAULT 'in_production',
    polygon GEOGRAPHY(POLYGON, 4326),
    crop_stage crop_stage DEFAULT 'production',
    last_flowering_date DATE,
    estimated_harvest_date DATE,
    fertilization_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plots_farm ON plots(farm_id);

-- ============================================================
-- 4. WAREHOUSES
-- ============================================================
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(20),
    whatsapp_phone VARCHAR(15),
    email VARCHAR(200),
    municipality VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    hours_text TEXT,
    accepts_digital_orders BOOLEAN DEFAULT true,
    commission_percentage DECIMAL(4,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_warehouses_location ON warehouses USING GIST(location);
CREATE INDEX idx_warehouses_department ON warehouses(department);
CREATE INDEX idx_warehouses_municipality ON warehouses(municipality);

-- ============================================================
-- 5. CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    sector sector_type NOT NULL DEFAULT 'coffee',
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true
);

-- ============================================================
-- 6. PRODUCTS
-- ============================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(300) NOT NULL,
    short_name VARCHAR(100),
    brand VARCHAR(100),
    presentation VARCHAR(100),
    unit_of_measure VARCHAR(20) NOT NULL,
    weight_kg DECIMAL(10,2),
    composition JSONB,
    description TEXT,
    image_url TEXT,
    sector sector_type NOT NULL DEFAULT 'coffee',
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products USING GIN(to_tsvector('spanish', name));
CREATE INDEX idx_products_sector ON products(sector);

-- ============================================================
-- 7. PRICES
-- ============================================================
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    unit_price DECIMAL(12,2) NOT NULL,
    price_per_nutrient_kg DECIMAL(12,2),
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER,
    origin price_origin NOT NULL DEFAULT 'manual',
    valid_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, warehouse_id)
);

CREATE INDEX idx_prices_product ON prices(product_id);
CREATE INDEX idx_prices_warehouse ON prices(warehouse_id);
CREATE INDEX idx_prices_updated ON prices(updated_at);

-- ============================================================
-- 8. PRICE HISTORY
-- ============================================================
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    unit_price DECIMAL(12,2) NOT NULL,
    origin price_origin NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON price_history(product_id, recorded_at);

-- ============================================================
-- 9. ORDERS
-- ============================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    farmer_id UUID NOT NULL REFERENCES users(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    status order_status DEFAULT 'pending',
    channel channel NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    commission DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    warehouse_confirmed_price DECIMAL(12,2),
    notes TEXT,
    warehouse_notes TEXT,
    confirmed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_farmer ON orders(farmer_id);
CREATE INDEX idx_orders_warehouse ON orders(warehouse_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

CREATE SEQUENCE order_number_seq START 1;

-- ============================================================
-- 10. ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- 11. SOIL ANALYSIS
-- ============================================================
CREATE TABLE soil_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID REFERENCES plots(id),
    farm_id UUID NOT NULL REFERENCES farms(id),
    user_id UUID NOT NULL REFERENCES users(id),
    lab_name VARCHAR(200),
    analysis_date DATE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    image_url TEXT,
    input_channel channel,
    ph DECIMAL(4,2),
    organic_matter DECIMAL(6,2),
    nitrogen DECIMAL(8,2),
    phosphorus DECIMAL(8,2),
    potassium DECIMAL(8,2),
    calcium DECIMAL(8,2),
    magnesium DECIMAL(8,2),
    aluminum DECIMAL(8,2),
    sodium DECIMAL(8,2),
    sulfur DECIMAL(8,2),
    iron DECIMAL(8,2),
    copper DECIMAL(8,2),
    manganese DECIMAL(8,2),
    zinc DECIMAL(8,2),
    boron DECIMAL(8,2),
    cec DECIMAL(8,2),
    electrical_conductivity DECIMAL(8,2),
    interpretation JSONB,
    recommendation JSONB,
    recommendation_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_soil_analysis_user ON soil_analysis(user_id);
CREATE INDEX idx_soil_analysis_farm ON soil_analysis(farm_id);
CREATE INDEX idx_soil_analysis_plot ON soil_analysis(plot_id);

-- ============================================================
-- 12. EXPENSES
-- ============================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    farm_id UUID REFERENCES farms(id),
    plot_id UUID REFERENCES plots(id),
    order_id UUID REFERENCES orders(id),
    category expense_category NOT NULL,
    description VARCHAR(300),
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    supplier VARCHAR(200),
    invoice_image_url TEXT,
    invoice_data JSONB,
    source VARCHAR(20) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_farm ON expenses(farm_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- ============================================================
-- 13. LABOR ENTRIES
-- ============================================================
CREATE TABLE labor_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    farm_id UUID REFERENCES farms(id),
    plot_id UUID REFERENCES plots(id),
    worker_name VARCHAR(200) NOT NULL,
    task VARCHAR(100) NOT NULL,
    days DECIMAL(4,1) NOT NULL,
    pay_per_day DECIMAL(10,2) NOT NULL,
    total_pay DECIMAL(12,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_labor_user ON labor_entries(user_id);
CREATE INDEX idx_labor_start ON labor_entries(start_date);

-- ============================================================
-- 14. FLOWERING RECORDS
-- ============================================================
CREATE TABLE flowering_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID NOT NULL REFERENCES plots(id),
    user_id UUID NOT NULL REFERENCES users(id),
    flowering_date DATE NOT NULL,
    intensity VARCHAR(20),
    image_url TEXT,
    estimated_harvest_date DATE,
    fertilization_date DATE,
    borer_critical_period_start DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flowering_plot ON flowering_records(plot_id);
CREATE INDEX idx_flowering_date ON flowering_records(flowering_date);

-- ============================================================
-- 15. ALERTS
-- ============================================================
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    type alert_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    sent_via channel,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_is_read ON alerts(user_id, is_read);

-- ============================================================
-- 16. CONVERSATIONS
-- ============================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    channel channel NOT NULL,
    whatsapp_message_id VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text',
    image_url TEXT,
    audio_url TEXT,
    transcription TEXT,
    tools_used JSONB,
    tokens_input INTEGER,
    tokens_output INTEGER,
    estimated_cost_usd DECIMAL(8,4),
    escalated_to_human BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id, created_at);
CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_escalated ON conversations(escalated_to_human) WHERE escalated_to_human = true;

-- ============================================================
-- 17. COOPERATIVES
-- ============================================================
CREATE TABLE cooperatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(20),
    municipality VARCHAR(100),
    department VARCHAR(100),
    contact_name VARCHAR(200),
    contact_phone VARCHAR(15),
    member_count INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE farmer_cooperative (
    farmer_id UUID REFERENCES users(id),
    cooperative_id UUID REFERENCES cooperatives(id),
    joined_at DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (farmer_id, cooperative_id)
);

-- ============================================================
-- 18. TRACEABILITY
-- ============================================================
CREATE TABLE traceability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID NOT NULL REFERENCES plots(id),
    user_id UUID NOT NULL REFERENCES users(id),
    harvest_period VARCHAR(20),
    coordinates_verified BOOLEAN DEFAULT false,
    deforestation_verified BOOLEAN DEFAULT false,
    satellite_verification_date DATE,
    good_practices JSONB,
    certificate_url TEXT,
    qr_code TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_traceability_plot ON traceability(plot_id);
CREATE INDEX idx_traceability_qr ON traceability(qr_code);

-- ============================================================
-- 19. REFERENCE PRICES (SIPSA)
-- ============================================================
CREATE TABLE reference_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(300) NOT NULL,
    department VARCHAR(100),
    avg_price DECIMAL(12,2),
    min_price DECIMAL(12,2),
    max_price DECIMAL(12,2),
    source VARCHAR(50) DEFAULT 'SIPSA',
    report_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ref_prices_product ON reference_prices(product_name, report_date);
CREATE INDEX idx_ref_prices_dept ON reference_prices(department);

-- ============================================================
-- 20. PURCHASE POOLS
-- ============================================================
CREATE TABLE purchase_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    municipality VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    total_quantity INTEGER DEFAULT 0,
    minimum_quantity INTEGER NOT NULL,
    target_price DECIMAL(12,2),
    deadline TIMESTAMPTZ NOT NULL,
    state VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pool_participants (
    pool_id UUID REFERENCES purchase_pools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (pool_id, user_id)
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION distance_km(point1 GEOGRAPHY, point2 GEOGRAPHY)
RETURNS DECIMAL AS $$
    SELECT ROUND((ST_Distance(point1, point2) / 1000)::NUMERIC, 1);
$$ LANGUAGE SQL IMMUTABLE;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'GV-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

CREATE OR REPLACE FUNCTION register_expense_on_order_confirm()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
        INSERT INTO expenses (user_id, order_id, category, description, amount, expense_date, supplier, source)
        SELECT
            NEW.farmer_id,
            NEW.id,
            'fertilizer',
            'Order ' || NEW.order_number,
            COALESCE(NEW.warehouse_confirmed_price, NEW.total),
            CURRENT_DATE,
            w.name,
            'marketplace'
        FROM warehouses w WHERE w.id = NEW.warehouse_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_expense_on_order
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION register_expense_on_order_confirm();

CREATE OR REPLACE FUNCTION save_price_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.unit_price IS DISTINCT FROM NEW.unit_price THEN
        INSERT INTO price_history (product_id, warehouse_id, unit_price, origin)
        VALUES (NEW.product_id, NEW.warehouse_id, NEW.unit_price, NEW.origin);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_price_history
    AFTER UPDATE ON prices
    FOR EACH ROW
    EXECUTE FUNCTION save_price_history();

CREATE OR REPLACE FUNCTION calculate_flowering_dates()
RETURNS TRIGGER AS $$
BEGIN
    NEW.estimated_harvest_date := NEW.flowering_date + INTERVAL '8 months';
    NEW.fertilization_date := NEW.estimated_harvest_date - INTERVAL '2 months';
    NEW.borer_critical_period_start := NEW.flowering_date + INTERVAL '120 days';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_flowering_dates
    BEFORE INSERT OR UPDATE ON flowering_records
    FOR EACH ROW
    EXECUTE FUNCTION calculate_flowering_dates();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowering_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "farmer_farms" ON farms FOR ALL USING (user_id = auth.uid());
CREATE POLICY "farmer_plots" ON plots FOR ALL USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));
CREATE POLICY "farmer_orders" ON orders FOR ALL USING (farmer_id = auth.uid());
CREATE POLICY "farmer_expenses" ON expenses FOR ALL USING (user_id = auth.uid());
CREATE POLICY "farmer_soil" ON soil_analysis FOR ALL USING (user_id = auth.uid());
CREATE POLICY "farmer_conversations" ON conversations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "farmer_alerts" ON alerts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "farmer_labor" ON labor_entries FOR ALL USING (user_id = auth.uid());
CREATE POLICY "farmer_flowering" ON flowering_records FOR ALL USING (user_id = auth.uid());

CREATE POLICY "warehouse_orders" ON orders FOR ALL USING (warehouse_id IN (SELECT id FROM warehouses WHERE user_id = auth.uid()));
