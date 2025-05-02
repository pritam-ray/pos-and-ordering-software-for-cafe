import { supabase } from './supabase';
import { Order, OrderItem, MenuCategory } from './types';

export async function createOrder(
  tableNumber: number,
  paymentMethod: 'cash' | 'online',
  totalAmount: number,
  items: { name: string; quantity: number; price: number }[]
): Promise<Order | null> {
  try {
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_number: tableNumber,
        payment_method: paymentMethod,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      item_name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return {
      ...order,
      order_items: orderItems as OrderItem[]
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

export async function fetchOrders(tableNumber?: number) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          item_name,
          quantity,
          price,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (tableNumber) {
      query = query.eq('table_number', tableNumber);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'preparing' | 'completed' | 'cancelled') {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

export async function fetchCategories(): Promise<MenuCategory[]> {
  try {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('order');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function createCategory(category: Omit<MenuCategory, 'id' | 'created_at'>): Promise<MenuCategory | null> {
  try {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    return null;
  }
}

export async function updateCategory(id: string, category: Partial<MenuCategory>): Promise<MenuCategory | null> {
  try {
    const { data, error } = await supabase
      .from('menu_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    return null;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
}