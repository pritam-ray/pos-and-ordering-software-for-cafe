/*
  # Enhance Inventory Management System

  1. New Columns
    - Add supplier information
    - Add category management
    - Add cost tracking
    - Add location tracking
    - Add expiry date tracking

  2. Security
    - Maintain existing RLS policies
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
ADD COLUMN IF NOT EXISTS unit_cost numeric(10,2) DEFAULT 0,
ALTER COLUMN type TYPE text CHECK (type IN ('restock', 'usage', 'waste', 'adjustment'));