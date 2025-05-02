import React from 'react';
import { ShoppingBag, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { TableOrder } from '../../lib/types';

interface DashboardStatsProps {
  tableGroups: Record<string, TableOrder[]>;
  totalRevenue: number;
  activeOrders: TableOrder[];
}

export function DashboardStats({ tableGroups, totalRevenue, activeOrders }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-primary-800/90 to-primary-900/90 backdrop-blur-lg rounded-2xl shadow-premium border border-primary-700/50 p-6 hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent-500/20 rounded-xl">
            <ShoppingBag className="w-7 h-7 text-accent-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-200">Active Tables</p>
            <p className="text-3xl font-bold text-white mt-1">{Object.keys(tableGroups).length}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-800/90 to-primary-900/90 backdrop-blur-lg rounded-2xl shadow-premium border border-primary-700/50 p-6 hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent-500/20 rounded-xl">
            <DollarSign className="w-7 h-7 text-accent-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-200">Today's Revenue</p>
            <p className="text-3xl font-bold text-white mt-1">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-800/90 to-primary-900/90 backdrop-blur-lg rounded-2xl shadow-premium border border-primary-700/50 p-6 hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent-500/20 rounded-xl">
            <Clock className="w-7 h-7 text-accent-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-200">Pending Orders</p>
            <p className="text-3xl font-bold text-white mt-1">
              {activeOrders.filter(o => o.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-800/90 to-primary-900/90 backdrop-blur-lg rounded-2xl shadow-premium border border-primary-700/50 p-6 hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent-500/20 rounded-xl">
            <TrendingUp className="w-7 h-7 text-accent-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-200">Orders Preparing</p>
            <p className="text-3xl font-bold text-white mt-1">
              {activeOrders.filter(o => o.status === 'preparing').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}