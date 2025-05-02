import React, { useState, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { OrderCard } from './OrderCard';
import toast from 'react-hot-toast';
import { subHours } from 'date-fns';

export function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!tableNumber) {
      toast.error('Please enter your table number');
      return;
    }

    setLoading(true);
    const twentyFourHoursAgo = subHours(new Date(), 24).toISOString();

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          item_name,
          quantity,
          price
        )
      `)
      .eq('table_number', parseInt(tableNumber))
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch orders');
      console.error(error);
    } else {
      setOrders(data || []);
      if (data?.length === 0) {
        toast('No orders found in the last 24 hours', {
          icon: 'ℹ️',
        });
      }
    }
    setLoading(false);
  };

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchOrders();
    }
  }, [fetchOrders, tableNumber]);

  return (
    <div className="min-h-[calc(100vh-10rem)] md:min-h-0 w-full max-w-lg mx-auto px-4 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-4 md:p-6"
      >
        <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-accent-400">Track Your Orders</h2>
        <p className="text-sm md:text-base text-primary-300 mb-4">View your orders from the last 24 hours</p>
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <input
            type="number"
            placeholder="Enter your table number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full md:flex-1 p-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent text-base"
            autoFocus
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchOrders}
            disabled={loading}
            className="w-full md:w-auto bg-accent-600 text-white px-6 py-3 rounded-lg hover:bg-accent-500 disabled:opacity-50 transition-colors shadow-lg font-medium"
          >
            {loading ? 'Loading...' : 'Track Orders'}
          </motion.button>
        </div>
      </motion.div>

      <div className="mt-6 space-y-4">
        <AnimatePresence>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </AnimatePresence>

        {orders.length === 0 && tableNumber && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-primary-300 py-8"
          >
            No orders found for this table in the last 24 hours
          </motion.div>
        )}
      </div>
    </div>
  );
}