/*
  # Create Orders Management Schema

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `table_number` (integer)
      - `status` (enum: pending, preparing, completed, cancelled)
      - `payment_method` (enum: cash, online)
      - `total_amount` (numeric)
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `item_name` (text)
      - `quantity` (integer)
      - `price` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for order management
*/

-- Safely create enums if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'completed', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('cash', 'online');
    END IF;
END $$;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number integer NOT NULL,
  status order_status DEFAULT 'pending',
  payment_method payment_method NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Anyone can create orders'
    ) THEN
        CREATE POLICY "Anyone can create orders"
        ON orders
        FOR INSERT
        TO public
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Anyone can read orders'
    ) THEN
        CREATE POLICY "Anyone can read orders"
        ON orders
        FOR SELECT
        TO public
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Anyone can update orders'
    ) THEN
        CREATE POLICY "Anyone can update orders"
        ON orders
        FOR UPDATE
        TO public
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Create policies for order items table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Anyone can create order items'
    ) THEN
        CREATE POLICY "Anyone can create order items"
        ON order_items
        FOR INSERT
        TO public
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Anyone can read order items'
    ) THEN
        CREATE POLICY "Anyone can read order items"
        ON order_items
        FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;