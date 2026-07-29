-- =======================================================
-- ESQUEMA DE BASE DE DATOS PARA SUPABASE / POSTGRESQL
-- Gestor de Menús Semanales y Lista de la Compra Inteligente
-- =======================================================

-- 1. TABLA DE PRODUCTOS (Catálogo de productos habituales del hogar)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Frescos', 'Despensa', 'Congelados', 'Especias')),
    default_unit VARCHAR(20) DEFAULT 'uds',
    is_essential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE LISTA DE LA COMPRA
CREATE TABLE IF NOT EXISTS shopping_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Frescos', 'Despensa', 'Congelados', 'Especias')),
    quantity DECIMAL(10, 2) DEFAULT 1.0,
    unit VARCHAR(20) DEFAULT 'uds',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'low_stock', 'bought')),
    added_from_menu BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE RECETAS
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'General',
    prep_time INT DEFAULT 30, -- minutos
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INGREDIENTES DE CADA RECETA
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'Despensa',
    quantity DECIMAL(10, 2) DEFAULT 1.0,
    unit VARCHAR(20) DEFAULT 'uds'
);

-- 5. CALENDARIO DE MENÚ SEMANAL
CREATE TABLE IF NOT EXISTS weekly_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_index INT NOT NULL CHECK (day_index BETWEEN 1 AND 7), -- 1: Lunes, 7: Domingo
    day_name VARCHAR(20) NOT NULL,
    meal_type VARCHAR(10) NOT NULL CHECK (meal_type IN ('lunch', 'dinner')), -- lunch: Comida, dinner: Cena
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    recipe_title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(day_index, meal_type)
);

-- INSERCIÓN DE DATOS INICIALES DE EJEMPLO (CATÁLOGO DE PRODUCTOS)
INSERT INTO products (name, category, default_unit, is_essential) VALUES
('Leche entera', 'Despensa', 'l', true),
('Huevos camperos', 'Frescos', 'docena', true),
('Pechuga de pollo', 'Frescos', 'kg', true),
('Arroz integral', 'Despensa', 'kg', true),
('Aceite de Oliva VV', 'Despensa', 'l', true),
('Tomates ensalada', 'Frescos', 'kg', false),
('Espinacas frescas', 'Frescos', 'bolsa', false),
('Salmón congelado', 'Congelados', 'paquete', false),
('Guisantes congelados', 'Congelados', 'kg', false),
('Orégano seco', 'Especias', 'bote', false),
('Pimentón de la Vera', 'Especias', 'bote', false),
('Ajo', 'Frescos', 'cabeza', true),
('Cebolla', 'Frescos', 'kg', true),
('Pasta Penne', 'Despensa', 'paquete', true)
ON CONFLICT (name) DO NOTHING;

-- INSERCIÓN DE RECETAS DE EJEMPLO
INSERT INTO recipes (id, title, description, category, prep_time, is_favorite) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pollo a la Plancha con Ensalada', 'Pechuga salpimentada a la plancha con tomates y espinacas', 'Saludable', 20, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Salmón al Horno con Guisantes', 'Lomo de salmón horneado y guisantes rehogados con ajo', 'Pescado', 25, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Pasta Penne con Tomate y Orégano', 'Pasta con salsa de tomate casera y especias', 'Pasta', 15, false)
ON CONFLICT DO NOTHING;

-- INGREDIENTES PARA RECETAS
INSERT INTO recipe_ingredients (recipe_id, product_name, category, quantity, unit) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pechuga de pollo', 'Frescos', 0.5, 'kg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tomates ensalada', 'Frescos', 2, 'uds'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Espinacas frescas', 'Frescos', 1, 'bolsa'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Salmón congelado', 'Congelados', 2, 'paquete'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Guisantes congelados', 'Congelados', 0.3, 'kg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Ajo', 'Frescos', 2, 'dientes'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Pasta Penne', 'Despensa', 1, 'paquete'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Tomates ensalada', 'Frescos', 3, 'uds'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Orégano seco', 'Especias', 1, 'pizca')
ON CONFLICT DO NOTHING;
