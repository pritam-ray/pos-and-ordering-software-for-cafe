/*
  # Fix Menu Items Schema and Policies

  1. Changes
    - Add proper constraints to menu_items table
    - Add RLS policies for menu items
    - Add indexes for better performance

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
*/

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated users to manage menu_items" ON menu_items;
    DROP POLICY IF EXISTS "Allow public to read menu_items" ON menu_items;

    -- Create new policies
    CREATE POLICY "Allow authenticated users to manage menu_items"
    ON menu_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

    CREATE POLICY "Allow public to read menu_items"
    ON menu_items
    FOR SELECT
    TO public
    USING (true);
END $$;

-- Add NOT NULL constraints
ALTER TABLE menu_items 
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN price SET NOT NULL,
    ALTER COLUMN image_url SET NOT NULL,
    ALTER COLUMN category_id SET NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items("order");