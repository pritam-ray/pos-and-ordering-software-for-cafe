import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { InventoryAnalytics } from '../../lib/types';
import { formatCurrency } from '../../lib/notification';
import { AlertTriangle, TrendingUp, Package, DollarSign } from 'lucide-react';

interface InventoryAnalyticsProps {
  analytics: InventoryAnalytics;
}

export function InventoryAnalyticsView({ analytics }: InventoryAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg p-4 border border-primary-700/50">
          <div className="flex items-center gap-3">
            <Package className="text-accent-400" />
            <div>
              <h3 className="text-primary-300 text-sm">Total Items</h3>
              <p className="text-2xl font-semibold text-white">{analytics.totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg p-4 border border-primary-700/50">
          <div className="flex items-center gap-3">
            <DollarSign className="text-accent-400" />
            <div>
              <h3 className="text-primary-300 text-sm">Total Value</h3>
              <p className="text-2xl font-semibold text-white">{formatCurrency(analytics.totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg p-4 border border-primary-700/50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" />
            <div>
              <h3 className="text-primary-300 text-sm">Low Stock Items</h3>
              <p className="text-2xl font-semibold text-white">{analytics.lowStockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg p-4 border border-primary-700/50">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-400" />
            <div>
              <h3 className="text-primary-300 text-sm">Wastage Rate</h3>
              <p className="text-2xl font-semibold text-white">
                {((analytics.wastageAnalytics.totalWastage / analytics.totalValue) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg p-6 border border-primary-700/50">
        <h3 className="text-xl font-semibold text-white mb-4">Low Stock Items</h3>
        <div className="space-y-4">
          {analytics.lowStockItems.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-4 bg-primary-700/30 rounded-lg border border-primary-600/30"
            >
              <div>
                <h4 className="font-medium text-white">{item.name}</h4>
                <p className="text-sm text-primary-300">
                  Current: {item.quantity} | Reorder Point: {item.reorderPoint}
                </p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-red-900/50 text-red-400 rounded-full text-sm">
                  Low Stock
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Trends */}
      <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg p-6 border border-primary-700/50">
        <h3 className="text-xl font-semibold text-white mb-4">Cost Trends</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.costTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Line type="monotone" dataKey="totalCost" stroke="#fbbf24" name="Total Cost" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Performance */}
      <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg p-6 border border-primary-700/50">
        <h3 className="text-xl font-semibold text-white mb-4">Supplier Performance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.supplierPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="reliability" fill="#fbbf24" name="Reliability" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {analytics.supplierPerformance.map((supplier) => (
              <div
                key={supplier.name}
                className="p-4 bg-primary-700/30 rounded-lg border border-primary-600/30"
              >
                <h4 className="font-medium text-white">{supplier.name}</h4>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <p className="text-primary-300">Reliability</p>
                    <p className="text-accent-400">{supplier.reliability}%</p>
                  </div>
                  <div>
                    <p className="text-primary-300">Avg. Delivery</p>
                    <p className="text-accent-400">{supplier.averageDeliveryTime} days</p>
                  </div>
                  <div>
                    <p className="text-primary-300">Quality Rating</p>
                    <p className="text-accent-400">{supplier.qualityRating}/5</p>
                  </div>
                  <div>
                    <p className="text-primary-300">Total Orders</p>
                    <p className="text-accent-400">{supplier.totalOrders}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}