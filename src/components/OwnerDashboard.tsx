import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, History, BarChart as ChartBar, Package, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { playNotificationSound, formatCurrency } from '../lib/notification';
import { fetchAnalytics } from '../lib/analytics';
import toast from 'react-hot-toast';
import { MenuManagement } from './MenuManagement';
import { ActiveTables } from './dashboard/ActiveTables';
import { AnalyticsDashboard } from './dashboard/AnalyticsDashboard';
import { ItemAnalyticsView } from './dashboard/ItemAnalytics';
import { InventoryAnalyticsView } from './dashboard/InventoryAnalytics';
import { DashboardStats } from './dashboard/DashboardStats';
import { Bill } from './Bill';
import { OrderCard } from './OrderCard';
import { UserRole } from '../lib/auth';
import { InventoryManagement } from './inventory/InventoryManagement';

type DashboardTab = 'active' | 'menu' | 'analytics' | 'items' | 'inventory' | 'history';

export function OwnerDashboard({ userRole }: { userRole: UserRole }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('active');
  const [activeOrders, setActiveOrders] = useState<TableOrder[]>([]);
  const [allOrders, setAllOrders] = useState<TableOrder[]>([]);
  const [tableGroups, setTableGroups] = useState<Record<string, TableOrder[]>>({});
  const [searchTable, setSearchTable] = useState('');
  const [showBill, setShowBill] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [printWindow, setPrintWindow] = useState<Window | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const isViewer = userRole === 'viewer';

  useEffect(() => {
    fetchOrders();
    loadAnalytics();
    const channel = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
          loadAnalytics();
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      if (printWindow) {
        printWindow.close();
      }
    };
  }, [userRole]);

  const loadAnalytics = async (startDate?: string, endDate?: string) => {
    try {
      const data = await fetchAnalytics(startDate, endDate);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const handleDateRangeChange = async (startDate: string, endDate: string) => {
    await loadAnalytics(startDate, endDate);
  };

  const fetchOrders = async () => {
    const { data: active, error: activeError } = await supabase
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
      .in('status', ['pending', 'preparing'])
      .order('created_at', { ascending: false });

    if (activeError) {
      toast.error('Failed to fetch active orders');
      return;
    }

    const { data: all, error: allError } = await supabase
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
      .order('created_at', { ascending: false });

    if (allError) {
      toast.error('Failed to fetch order history');
      return;
    }

    const groups = active.reduce((acc: Record<string, TableOrder[]>, order: TableOrder) => {
      if (!acc[order.table_number]) {
        acc[order.table_number] = [];
      }
      acc[order.table_number].push(order);
      return acc;
    }, {});

    setTableGroups(groups);
    setActiveOrders(active || []);
    setAllOrders(all || []);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      if (isViewer) {
        setActiveOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
        setAllOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
        toast.success('Order status updated (view only)');
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        toast.error('Failed to update order status');
      } else {
        toast.success('Order status updated');
        fetchOrders();
        loadAnalytics();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      if (isViewer) {
        setActiveOrders(prev => prev.filter(order => order.id !== orderId));
        setAllOrders(prev => prev.filter(order => order.id !== orderId));
        toast.success('Order deleted (view only)');
        return;
      }

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        toast.error('Failed to delete order');
      } else {
        toast.success('Order deleted successfully');
        fetchOrders();
        loadAnalytics();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const handlePrint = (order: TableOrder) => {
    setShowBill(order.id);
    
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (!newWindow) {
      toast.error('Please allow pop-ups to print bills');
      return;
    }

    setPrintWindow(newWindow);

    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - Table ${order.table_number}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div id="bill-content">
            ${document.getElementById('bill-content')?.innerHTML || ''}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    newWindow.document.close();
    setShowBill(null);
  };

  const tabs = [
    { id: 'active', icon: LayoutDashboard, label: 'Active Tables' },
    { id: 'menu', icon: Receipt, label: 'Menu Management' },
    { id: 'analytics', icon: ChartBar, label: 'Analytics' },
    { id: 'items', icon: TrendingUp, label: 'Item Analytics' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'history', icon: History, label: 'Order History' }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-4">
        <div className="flex flex-wrap gap-4">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as DashboardTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-accent-600/20 text-accent-400'
                  : 'bg-primary-700/50 text-primary-300 hover:bg-primary-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'active' && (
        <div className="space-y-6">
          <DashboardStats
            tableGroups={tableGroups}
            totalRevenue={analytics?.revenue.today || 0}
            activeOrders={activeOrders}
          />
          <ActiveTables
            tableGroups={tableGroups}
            searchTable={searchTable}
            setSearchTable={setSearchTable}
            updateOrderStatus={isViewer ? undefined : updateOrderStatus}
            handlePrint={handlePrint}
          />
        </div>
      )}

      {activeTab === 'menu' && <MenuManagement userRole={userRole} />}

      {activeTab === 'analytics' && analytics && (
        <AnalyticsDashboard 
          analytics={analytics} 
          onDateRangeChange={handleDateRangeChange}
        />
      )}

      {activeTab === 'items' && analytics && (
        <div className="space-y-6">
          <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Item Analytics</h2>
            {selectedItemId && analytics.itemAnalytics.items[selectedItemId] ? (
              <ItemAnalyticsView 
                analytics={analytics.itemAnalytics.items[selectedItemId]} 
                onBack={() => setSelectedItemId(null)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
                  <div className="space-y-3">
                    {analytics.itemAnalytics.topPerformers.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className="w-full text-left p-3 bg-primary-800/50 rounded-lg hover:bg-primary-800 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white">{item.name}</span>
                          <span className="text-accent-400">{formatCurrency(item.revenue)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-primary-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Low Performers</h3>
                  <div className="space-y-3">
                    {analytics.itemAnalytics.lowPerformers.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className="w-full text-left p-3 bg-primary-800/50 rounded-lg hover:bg-primary-800 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white">{item.name}</span>
                          <span className="text-red-400">{formatCurrency(item.revenue)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Inventory Management</h2>
            <InventoryManagement isViewer={isViewer} />
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Order History</h2>
          <div className="space-y-4">
            {allOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isOwner={!isViewer}
                onStatusChange={isViewer ? undefined : updateOrderStatus}
                onDelete={isViewer ? undefined : deleteOrder}
              />
            ))}
          </div>
        </div>
      )}

      {showBill && (
        <div className="hidden">
          <div id="bill-content">
            <Bill order={allOrders.find(o => o.id === showBill)} />
          </div>
        </div>
      )}
    </div>
  );
}