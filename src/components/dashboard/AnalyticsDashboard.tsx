import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter } from 'recharts';
import { Analytics } from '../../lib/types';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { RefreshCw } from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: Analytics;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

const COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#818cf8'];

export function AnalyticsDashboard({ analytics, onDateRangeChange }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter data based on date range
  const filteredData = {
    ...analytics,
    revenue: {
      ...analytics.revenue,
      byDay: analytics.revenue.byDay.filter(day => {
        const date = new Date(day.date);
        return date >= startOfDay(new Date(dateRange.start)) &&
               date <= endOfDay(new Date(dateRange.end));
      })
    }
  };

  const handleUpdate = async () => {
    if (onDateRangeChange) {
      setIsUpdating(true);
      await onDateRangeChange(dateRange.start, dateRange.end);
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Updating...' : 'Update Analytics'}
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h3 className="text-primary-300 mb-2">Today's Revenue</h3>
          <p className="text-3xl font-semibold text-white">₹{filteredData.revenue.today.toFixed(2)}</p>
          <p className="text-sm text-primary-400 mt-2">
            {filteredData.revenue.growth.daily > 0 ? '+' : ''}{filteredData.revenue.growth.daily.toFixed(1)}% vs yesterday
          </p>
        </div>

        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h3 className="text-primary-300 mb-2">Weekly Revenue</h3>
          <p className="text-3xl font-semibold text-white">₹{filteredData.revenue.thisWeek.toFixed(2)}</p>
          <p className="text-sm text-primary-400 mt-2">
            {filteredData.revenue.growth.weekly > 0 ? '+' : ''}{filteredData.revenue.growth.weekly.toFixed(1)}% vs last week
          </p>
        </div>

        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h3 className="text-primary-300 mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-semibold text-white">₹{filteredData.revenue.thisMonth.toFixed(2)}</p>
          <p className="text-sm text-primary-400 mt-2">
            Average daily: ₹{(filteredData.revenue.thisMonth / 30).toFixed(2)}
          </p>
        </div>

        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h3 className="text-primary-300 mb-2">Performance</h3>
          <p className="text-3xl font-semibold text-white">{filteredData.performance.completionRate.toFixed(1)}%</p>
          <p className="text-sm text-primary-400 mt-2">Order completion rate</p>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Orders by Status</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData.orders.byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {filteredData.orders.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                  formatter={(value, name) => [`${value} orders`, name]} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Revenue by Payment Method</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Cash', value: filteredData.revenue.byPaymentMethod.cash },
                    { name: 'Online', value: filteredData.revenue.byPaymentMethod.online }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {[0, 1].map((index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                  formatter={(value) => `₹${Number(value).toFixed(2)}`} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Time-based Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Orders by Time of Day</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { name: 'Morning', value: filteredData.orders.byTimeOfDay.morning },
                { name: 'Afternoon', value: filteredData.orders.byTimeOfDay.afternoon },
                { name: 'Evening', value: filteredData.orders.byTimeOfDay.evening },
                { name: 'Night', value: filteredData.orders.byTimeOfDay.night }
              ]}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="name" stroke="#9ca3af" />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar name="Orders" dataKey="value" fill={COLORS[0]} fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Revenue Trend</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData.revenue.byDay}>
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
                  formatter={(value) => `₹${Number(value).toFixed(2)}`} 
                />
                <Line type="monotone" dataKey="amount" stroke={COLORS[2]} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Item Performance */}
      <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Item Performance Analysis</h3>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid stroke="#374151" />
              <XAxis type="number" dataKey="quantity" name="Quantity Sold" stroke="#9ca3af" />
              <YAxis type="number" dataKey="revenue" name="Revenue" stroke="#9ca3af" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              />
              <Scatter
                name="Items"
                data={filteredData.items.popular}
                fill={COLORS[0]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Items by Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(filteredData.items.byTime).map(([timeSlot, items]) => (
          <div key={timeSlot} className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
            <h3 className="text-xl font-semibold mb-4 capitalize text-white">{timeSlot} Top Items</h3>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-primary-300">
                    {index + 1}. {item.name}
                  </span>
                  <span className="font-medium text-accent-400">{item.count} orders</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Table Performance */}
      <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Table Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.tables.mostActive.map((table) => (
            <div key={table.number} className="bg-primary-700/50 backdrop-blur-lg rounded-lg p-4 border border-primary-600/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">Table #{table.number}</span>
                <span className="text-sm text-primary-300">{table.orders} orders</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-300">Avg. Order Value</span>
                  <span className="text-accent-400">
                    ₹{filteredData.tables.averageOrderValue.find(t => t.number === table.number)?.value.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-300">Turnover Rate</span>
                  <span className="text-accent-400">
                    {filteredData.tables.turnoverRate.find(t => t.number === table.number)?.rate.toFixed(1)}x
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-300">24h Orders</span>
                  <span className="text-accent-400">{table.last24HourOrders}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Key Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-primary-300">Completion Rate</span>
              <span className="font-medium text-accent-400">{filteredData.performance.completionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-300">Cancellation Rate</span>
              <span className="font-medium text-red-400">{filteredData.performance.cancellationRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-300">Average Order Value</span>
              <span className="font-medium text-accent-400">₹{filteredData.performance.averageOrderValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Peak Hours</h3>
          <div className="space-y-4">
            {filteredData.performance.peakHours.map((peak, index) => (
              <div key={peak.hour} className="flex justify-between items-center">
                <span className="text-primary-300">
                  #{index + 1} Peak: {peak.hour}
                </span>
                <div className="text-right">
                  <div className="font-medium text-accent-400">{peak.orders} orders</div>
                  <div className="text-sm text-primary-400">₹{peak.revenue.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}