import React from 'react';
import { getStatusColor } from '../../lib/notification';

interface OrderStatusSelectProps {
  status: string;
  orderId: string;
  onStatusChange: (orderId: string, status: string) => void;
}

export function OrderStatusSelect({ status, orderId, onStatusChange }: OrderStatusSelectProps) {
  return (
    <select
      value={status}
      onChange={(e) => onStatusChange(orderId, e.target.value)}
      className={`text-sm rounded-lg px-3 py-1.5 bg-primary-700/50 border border-primary-600 focus:ring-2 focus:ring-accent-500 focus:border-transparent ${
        status === 'completed' ? 'text-green-400' :
        status === 'preparing' ? 'text-yellow-400' :
        status === 'cancelled' ? 'text-red-400' :
        'text-accent-400'
      }`}
    >
      <option value="pending">Pending</option>
      <option value="preparing">Preparing</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}