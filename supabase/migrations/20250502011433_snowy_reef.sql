/*
  # Create Inventory Management Tables

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text)
      - `quantity` (integer, default 0)
      - `unit` (text, required)
      - `min_quantity` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `inventory_transactions`
      - `id` (uuid, primary key)
      - `item_id` (uuid, foreign key to inventory_items)
      - `quantity_change` (integer, required)
      - `type` (text, required) - 'addition' or 'deduction'
      - `notes` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all inventory items
      - Create/update inventory items
      - Create inventory transactions
*/

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    quantity integer NOT NULL DEFAULT 0,
    unit text NOT NULL,
    min_quantity integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity_change integer NOT NULL,
    type text NOT NULL CHECK (type IN ('addition', 'deduction')),
    notes text,
    created_at timestamptz DEFAULT now(),
    created_by uuid NOT NULL REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for inventory_items
CREATE POLICY "Allow authenticated users to read inventory items"
    ON public.inventory_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to create inventory items"
    ON public.inventory_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update inventory items"
    ON public.inventory_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policies for inventory_transactions
CREATE POLICY "Allow authenticated users to read inventory transactions"
    ON public.inventory_transactions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to create inventory transactions"
    ON public.inventory_transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();