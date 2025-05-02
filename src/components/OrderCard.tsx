import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, getStatusColor, formatDate } from '../lib/notification';
import { Printer, Trash2 } from 'lucide-react';
import { Bill } from './Bill';

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  table_number: number;
  status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  isOwner?: boolean;
  onStatusChange?: (orderId: string, status: string) => void;
  onDelete?: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, isOwner, onStatusChange, onDelete }) => {
  const [showBill, setShowBill] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    setShowBill(true);
    
    // Create a new iframe for printing
    const printFrame = printFrameRef.current;
    if (!printFrame) return;

    // Set up iframe content
    const iframeDoc = printFrame.contentDocument;
    if (!iframeDoc) return;

    // Write the bill content to the iframe
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>Bill</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              img { max-width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          ${document.getElementById('bill-content')?.innerHTML || ''}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Print the iframe content
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();

    // Hide the bill after printing
    setShowBill(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      setIsDeleting(true);
      await onDelete?.(order.id);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6 mb-4"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Table #{order.table_number}</h3>
            <p className="text-primary-400 text-sm">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <button
                  onClick={handlePrint}
                  className="p-2 bg-accent-600/20 text-accent-400 rounded-full hover:bg-accent-600/30 transition-colors"
                  title="Print Bill"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 bg-red-900/20 text-red-400 rounded-full hover:bg-red-900/30 transition-colors disabled:opacity-50"
                  title="Delete Order"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            {isOwner ? (
              <select
                value={order.status}
                onChange={(e) => onStatusChange?.(order.id, e.target.value)}
                className="bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-accent-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                order.status === 'preparing' ? 'bg-yellow-900/50 text-yellow-400' :
                order.status === 'cancelled' ? 'bg-red-900/50 text-red-400' :
                'bg-blue-900/50 text-blue-400'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            )}
          </div>
        </div>

        <div className="bg-primary-700/30 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-lg mb-3 text-white">Order Details:</h4>
          <div className="space-y-3">
            {order.order_items && order.order_items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-primary-800/50 rounded-lg transition-colors border border-primary-700/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{item.item_name}</span>
                    <span className="bg-accent-900/50 text-accent-400 px-2 py-0.5 rounded-full text-sm">
                      × {item.quantity}
                    </span>
                  </div>
                  <div className="text-sm text-primary-400 mt-1">
                    {formatCurrency(item.price)} per item
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  <div className="font-semibold text-accent-400">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-primary-700/30">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <span className="font-semibold text-lg text-white">
              Total: {formatCurrency(order.total_amount)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.payment_method === 'cash'
                ? 'bg-green-900/50 text-green-400'
                : 'bg-blue-900/50 text-blue-400'
            }`}>
              {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Hidden bill content */}
      {showBill && (
        <div className="hidden">
          <div id="bill-content">
            <Bill order={order} />
          </div>
        </div>
      )}

      {/* Hidden iframe for printing */}
      <iframe
        ref={printFrameRef}
        style={{ display: 'none' }}
        title="Print Frame"
      />
    </>
  );
};