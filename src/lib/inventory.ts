import { supabase } from './supabase';
import { InventoryItem, InventoryTransaction } from './types';

export async function fetchInventoryItems() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
}

export async function fetchInventoryTransactions(itemId?: string) {
  let query = supabase
    .from('inventory_transactions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (itemId) {
    query = query.eq('item_id', itemId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function createInventoryTransaction(transaction: Omit<InventoryTransaction, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('inventory_transactions')
    .insert([transaction])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}