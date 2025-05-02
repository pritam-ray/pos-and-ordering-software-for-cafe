/*
  # Create Menu Categories Schema

  1. New Tables
    - `menu_categories`
      - `id` (uuid, primary key)
      - `title` (text)
      - `note` (text, nullable)
      - `order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for menu categories management
*/

-- Create menu categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  note text,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- Create policies with safety checks
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated users to manage menu_categories" ON menu_categories;
    DROP POLICY IF EXISTS "Allow public read access on menu_categories" ON menu_categories;

    -- Create new policies
    CREATE POLICY "Allow authenticated users to manage menu_categories"
    ON menu_categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

    CREATE POLICY "Allow public read access on menu_categories"
    ON menu_categories
    FOR SELECT
    TO public
    USING (true);
END $$;

-- Add index for ordering
CREATE INDEX IF NOT EXISTS idx_menu_categories_order ON menu_categories("order");