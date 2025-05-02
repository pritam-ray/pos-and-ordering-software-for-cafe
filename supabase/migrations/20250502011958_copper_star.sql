/*
  # Enhance Inventory Management

  1. Changes to inventory_items
    - Add category and supplier tracking
    - Add cost tracking
    - Add location and expiry tracking
    - Add reorder quantity management

  2. Changes to inventory_transactions
    - Add quantity tracking (previous and new)
    - Add unit cost tracking
    - Add transaction type constraints
*/

-- Add new columns to inventory_items
ALTER TABLE public.inventory_items
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS supplier text,
ADD COLUMN IF NOT EXISTS cost_per_unit numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS expiry_date date,
ADD COLUMN IF NOT EXISTS last_ordered_date timestamptz,
ADD COLUMN IF NOT EXISTS reorder_quantity integer DEFAULT 0;

-- Add new columns to inventory_transactions
ALTER TABLE public.inventory_transactions
ADD COLUMN IF NOT EXISTS previous_quantity integer,
ADD COLUMN IF NOT EXISTS new_quantity integer,
ADD COLUMN IF NOT EXISTS unit_cost numeric(10,2) DEFAULT 0;

-- Add type constraint to inventory_transactions
ALTER TABLE public.inventory_transactions
ALTER COLUMN type TYPE text;

-- Add check constraint for type values
ALTER TABLE public.inventory_transactions
ADD CONSTRAINT inventory_transactions_type_check 
CHECK (type IN ('restock', 'usage', 'waste', 'adjustment'));