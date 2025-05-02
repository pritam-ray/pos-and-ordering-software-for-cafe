/*
  # Update menu_categories RLS policies

  1. Changes
    - Drop existing RLS policies for menu_categories table
    - Create new, more permissive policies for menu management
  
  2. Security
    - Enable RLS on menu_categories table (ensuring it's enabled)
    - Add policies for:
      - Public read access to categories
      - Full CRUD access for authenticated users
*/

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage menu_categories" ON menu_categories;
DROP POLICY IF EXISTS "Allow public read access on menu_categories" ON menu_categories;

-- Ensure RLS is enabled
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- Create new policies

-- Allow anyone to read categories
CREATE POLICY "Allow public read access on menu_categories"
ON menu_categories
FOR SELECT
TO public
USING (true);

-- Allow authenticated users full access to manage categories
CREATE POLICY "Allow authenticated users to manage menu_categories"
ON menu_categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);