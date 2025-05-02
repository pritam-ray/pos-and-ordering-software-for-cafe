import React from 'react';
import { motion } from 'framer-motion';
import { Search, Printer } from 'lucide-react';
import { TableOrder, TableGroup } from '../../lib/types';
import { OrderStatusSelect } from './OrderStatusSelect';
import { formatCurrency } from '../../lib/notification';

interface ActiveTablesProps {
  tableGroups: TableGroup;
  searchTable: string;
  setSearchTable: (value: string) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  handlePrint: (order: TableOrder) => void;
}

export function ActiveTables({
  tableGroups,
  searchTable,
  setSearchTable,
  updateOrderStatus,
  handlePrint,
}: ActiveTablesProps) {
  const filteredTables = Object.entries(tableGroups)
    .filter(([tableNumber]) => 
      searchTable ? tableNumber.includes(searchTable) : true
    )
    .sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Active Tables</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search table..."
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            className="pl-10 pr-4 py-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map(([tableNumber, orders]) => (
          <motion.div
            key={tableNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-700/50 backdrop-blur-lg rounded-lg p-4 border border-primary-600/50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Table {tableNumber}</h3>
              <span className="px-3 py-1 bg-accent-600/20 text-accent-400 rounded-full text-sm">
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-primary-800/50 rounded-lg p-4 shadow-sm border border-primary-700/50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-sm text-primary-300">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </span>
                      {order.customer_name && (
                        <p className="text-sm font-medium text-accent-400 mt-1">
                          Customer: {order.customer_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrint(order)}
                        className="p-2 bg-accent-600/20 text-accent-400 rounded-full hover:bg-accent-600/30 transition-colors"
                        title="Print Bill"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      <OrderStatusSelect
                        status={order.status}
                        orderId={order.id}
                        onStatusChange={updateOrderStatus}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-primary-200">{item.item_name} × {item.quantity}</span>
                        <span className="text-accent-400">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-primary-600/50 flex justify-between items-center">
                    <span className="font-medium text-primary-300">Total</span>
                    <span className="font-semibold text-accent-400">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}