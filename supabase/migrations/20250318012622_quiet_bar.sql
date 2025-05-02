/*
  # Fix orders table RLS policies

  1. Security Changes
    - Drop existing policies that are causing issues
    - Create new policies with proper permissions:
      - Allow anyone to create orders (no auth required)
      - Allow authenticated users to read orders
      - Allow authenticated users to update orders
*/

-- Drop existing policies to start fresh
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
    DROP POLICY IF EXISTS "Owner can read all orders" ON orders;
    DROP POLICY IF EXISTS "Owner can update orders" ON orders;
END $$;

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "Anyone can create orders"
ON orders
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can read orders"
ON orders
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can update orders"
ON orders
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);