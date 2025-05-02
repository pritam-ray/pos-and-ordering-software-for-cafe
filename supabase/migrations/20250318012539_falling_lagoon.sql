/*
  # Add RLS policies for orders table

  1. Security Changes
    - Enable RLS on orders table (if not already enabled)
    - Safely create or update policies to allow:
      - Public users to create orders
      - Authenticated users to read all orders
      - Authenticated users to update orders
*/

-- Enable RLS (safe if already enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Safely create insert policy
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
END $$;

-- Safely create select policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Owner can read all orders'
    ) THEN
        CREATE POLICY "Owner can read all orders"
        ON orders
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END $$;

-- Safely create update policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Owner can update orders'
    ) THEN
        CREATE POLICY "Owner can update orders"
        ON orders
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;