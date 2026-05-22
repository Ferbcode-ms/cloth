-- Supabase Database Schema for Clothing E-commerce Website
-- Execute this SQL script in your Supabase SQL Editor

-- 1. Create Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for lowercase email queries
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  discount NUMERIC DEFAULT 0 NOT NULL,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  subcategories JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);

-- 3. Create Colors Table
CREATE TABLE IF NOT EXISTS colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL UNIQUE,
  hex TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create Sizes Table
CREATE TABLE IF NOT EXISTS sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL UNIQUE,
  "order" INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sizes_order ON sizes ("order");

-- 5. Create Sliders Table
CREATE TABLE IF NOT EXISTS sliders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  "order" INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sliders_order ON sliders ("order");

-- 6. Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  banner JSONB DEFAULT '{"text": "Sign up and get 20% off to your first order.", "linkUrl": "/products", "linkText": "Sign Up Now", "isVisible": true}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed initial settings row if none exists
INSERT INTO settings (banner) 
SELECT '{"text": "Sign up and get 20% off to your first order.", "linkUrl": "/products", "linkText": "Sign Up Now", "isVisible": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- 7. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  subcategory TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of image URLs
  variants JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of IProductVariant
  slug TEXT NOT NULL UNIQUE,
  order_count INTEGER DEFAULT 0 NOT NULL CHECK (order_count >= 0),
  discount NUMERIC DEFAULT 0 NOT NULL CHECK (discount >= 0),
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  colors TEXT[] DEFAULT '{}'::text[] NOT NULL, -- Helper column populated dynamically for easy filtering
  sizes TEXT[] DEFAULT '{}'::text[] NOT NULL,  -- Helper column populated dynamically for easy filtering
  total_stock INTEGER DEFAULT 0 NOT NULL,     -- Helper column populated dynamically for easy filtering
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products (subcategory);
CREATE INDEX IF NOT EXISTS idx_products_colors ON products USING gin (colors);
CREATE INDEX IF NOT EXISTS idx_products_sizes ON products USING gin (sizes);
CREATE INDEX IF NOT EXISTS idx_products_total_stock ON products (total_stock);

-- 8. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of IOrderItem
  customer JSONB NOT NULL, -- Customer details object
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- 9. Create place_order_transaction PostgreSQL Function
CREATE OR REPLACE FUNCTION place_order_transaction(
  p_items JSONB,
  p_customer JSONB,
  p_total_amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_product RECORD;
  v_variants JSONB;
  v_updated_variants JSONB;
  v_new_order_id UUID;
  v_order_item RECORD;
  v_variant_idx INT;
  v_size_idx INT;
  v_found_variant BOOLEAN;
  v_found_size BOOLEAN;
BEGIN
  -- We loop through each item in the order to check stock and deduct
  FOR v_order_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (
    "productId" UUID,
    "title" TEXT,
    "price" NUMERIC,
    "quantity" INT,
    "color" TEXT,
    "size" TEXT
  ) LOOP
    
    -- Select product for update to lock the row and prevent race conditions
    SELECT * INTO v_product FROM products WHERE id = v_order_item."productId" FOR UPDATE;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % not found', v_order_item."productId";
    END IF;
    
    -- Loop through variants jsonb array to find matching color and size
    v_found_variant := FALSE;
    v_found_size := FALSE;
    v_variants := v_product.variants;
    v_updated_variants := '[]'::jsonb;
    
    FOR v_variant_idx IN 0 .. jsonb_array_length(v_variants) - 1 LOOP
      DECLARE
        v_var JSONB := v_variants->v_variant_idx;
        v_sizes JSONB := v_var->'sizes';
        v_updated_sizes JSONB := '[]'::jsonb;
        v_size_val JSONB;
      BEGIN
        IF v_var->>'color' = v_order_item."color" THEN
          v_found_variant := TRUE;
          
          -- Find size
          FOR v_size_idx IN 0 .. jsonb_array_length(v_sizes) - 1 LOOP
            v_size_val := v_sizes->v_size_idx;
            IF v_size_val->>'size' = v_order_item."size" THEN
              v_found_size := TRUE;
              
              -- Check stock
              IF (v_size_val->>'stock')::INT < v_order_item."quantity" THEN
                RAISE EXCEPTION 'Insufficient stock for % - % - %. Available: %', 
                  v_product.title, v_order_item."color", v_order_item."size", v_size_val->>'stock';
              END IF;
              
              -- Deduct stock
              v_size_val := jsonb_set(v_size_val, '{stock}', ((v_size_val->>'stock')::INT - v_order_item."quantity")::TEXT::jsonb);
            END IF;
            v_updated_sizes := v_updated_sizes || v_size_val;
          END LOOP;
          
          IF NOT v_found_size THEN
            RAISE EXCEPTION 'Size % not available for product % - %', 
              v_order_item."size", v_product.title, v_order_item."color";
          END IF;
          
          v_var := jsonb_set(v_var, '{sizes}', v_updated_sizes);
        END IF;
        
        v_updated_variants := v_updated_variants || v_var;
      END;
    END LOOP;
    
    IF NOT v_found_variant THEN
      RAISE EXCEPTION 'Variant for color % not found for product %', 
        v_order_item."color", v_product.title;
    END IF;
    
    -- Recalculate helper arrays/values: colors, sizes, total_stock
    DECLARE
      v_colors TEXT[] := '{}'::text[];
      v_sizes_arr TEXT[] := '{}'::text[];
      v_total_stock INT := 0;
      v_var_rec RECORD;
      v_size_rec RECORD;
    BEGIN
      FOR v_var_rec IN SELECT * FROM jsonb_to_recordset(v_updated_variants) AS (color TEXT, sizes JSONB) LOOP
        IF v_var_rec.color IS NOT NULL THEN
          v_colors := array_append(v_colors, v_var_rec.color);
        END IF;
        FOR v_size_rec IN SELECT * FROM jsonb_to_recordset(v_var_rec.sizes) AS (size TEXT, stock INT) LOOP
          IF v_size_rec.size IS NOT NULL THEN
            v_sizes_arr := array_append(v_sizes_arr, v_size_rec.size);
          END IF;
          IF v_size_rec.stock IS NOT NULL THEN
            v_total_stock := v_total_stock + v_size_rec.stock;
          END IF;
        END LOOP;
      END LOOP;
      
      -- Update product with new variants, total stock, and increment order count
      UPDATE products 
      SET 
        variants = v_updated_variants,
        total_stock = v_total_stock,
        colors = ARRAY(SELECT DISTINCT unnest(v_colors)),
        sizes = ARRAY(SELECT DISTINCT unnest(v_sizes_arr)),
        order_count = order_count + v_order_item."quantity",
        updated_at = NOW()
      WHERE id = v_product.id;
    END;
    
  END LOOP;
  
  -- Create the order record
  INSERT INTO orders (items, customer, total_amount, status)
  VALUES (p_items, p_customer, p_total_amount, 'Pending')
  RETURNING id INTO v_new_order_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'orderId', v_new_order_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;
