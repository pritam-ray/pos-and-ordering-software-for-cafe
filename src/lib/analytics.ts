import { supabase } from './supabase';
import { Analytics, Order, OrderItem, MenuItem } from './types';
import { startOfDay, startOfWeek, startOfMonth, subDays, format, subHours, eachHourOfInterval } from 'date-fns';

export async function fetchAnalytics(startDate?: string, endDate?: string): Promise<Analytics> {
  // Fetch actual orders data from Supabase
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  if (ordersError) throw ordersError;

  // Fetch menu items
  const { data: menuItems, error: menuItemsError } = await supabase
    .from('menu_items')
    .select('*')
    .order('name');

  if (menuItemsError) throw menuItemsError;

  // Fetch menu categories
  const { data: categories, error: categoriesError } = await supabase
    .from('menu_categories')
    .select('*')
    .order('title');

  if (categoriesError) throw categoriesError;

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const last24Hours = subHours(now, 24);

  // Filter orders by date ranges
  const todayOrders = orders.filter(order => new Date(order.created_at) >= todayStart);
  const weekOrders = orders.filter(order => new Date(order.created_at) >= weekStart);
  const monthOrders = orders.filter(order => new Date(order.created_at) >= monthStart);
  const last24HourOrders = orders.filter(order => new Date(order.created_at) >= last24Hours);

  // Calculate revenue metrics
  const calculateRevenue = (orderList: Order[]) => 
    orderList.reduce((sum, order) => sum + order.total_amount, 0);

  const revenueByPayment = orders.reduce(
    (acc, order) => {
      acc[order.payment_method] += order.total_amount;
      return acc;
    },
    { cash: 0, online: 0 }
  );

  // Calculate revenue by day
  const revenueByDay = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(now, index);
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      date: format(date, 'MMM dd'),
      amount: orders
        .filter(order => format(new Date(order.created_at), 'yyyy-MM-dd') === dateStr)
        .reduce((sum, order) => sum + order.total_amount, 0)
    };
  }).reverse();

  // Calculate order statistics
  const ordersByStatus = ['pending', 'preparing', 'completed', 'cancelled'].map(status => ({
    status,
    count: orders.filter(order => order.status === status).length,
    revenue: orders
      .filter(order => order.status === status)
      .reduce((sum, order) => sum + order.total_amount, 0)
  }));

  // Calculate item analytics
  const itemAnalytics = menuItems.reduce((acc, menuItem) => {
    const itemOrders = orders.flatMap(order => 
      order.order_items.filter(item => item.item_name === menuItem.name)
    );

    const totalOrders = itemOrders.length;
    const totalRevenue = itemOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate orders by time of day
    const ordersByTime = itemOrders.reduce((timeAcc, item) => {
      const hour = new Date(item.created_at).getHours();
      if (hour >= 6 && hour < 12) timeAcc.morning++;
      else if (hour >= 12 && hour < 17) timeAcc.afternoon++;
      else if (hour >= 17 && hour < 22) timeAcc.evening++;
      else timeAcc.night++;
      return timeAcc;
    }, { morning: 0, afternoon: 0, evening: 0, night: 0 });

    // Calculate sales trend
    const salesTrend = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOrders = itemOrders.filter(item => 
        format(new Date(item.created_at), 'yyyy-MM-dd') === dateStr
      );
      return {
        date: format(date, 'MMM dd'),
        quantity: dayOrders.reduce((sum, item) => sum + item.quantity, 0),
        revenue: dayOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    }).reverse();

    acc[menuItem.id] = {
      id: menuItem.id,
      name: menuItem.name,
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      popularCombinations: calculatePopularCombinations(orders, menuItem.name),
      ordersByTimeOfDay: ordersByTime,
      salesTrend,
      customerFeedback: calculateCustomerFeedback(itemOrders),
      profitMargin: calculateProfitMargin(menuItem, itemOrders),
      wastageRate: calculateWastageRate(menuItem, itemOrders),
      preparationTime: calculatePreparationTime(itemOrders)
    };

    return acc;
  }, {});

  // Sort items by revenue
  const sortedItems = Object.values(itemAnalytics)
    .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

  const topPerformers = sortedItems.slice(0, 5);
  const lowPerformers = sortedItems.slice(-5);

  // Calculate inventory analytics
  const inventoryAnalytics = {
    totalItems: menuItems.length,
    totalValue: menuItems.reduce((sum, item) => sum + item.price, 0),
    lowStockItems: calculateLowStockItems(menuItems, orders),
    wastageAnalytics: calculateWastageAnalytics(menuItems, orders),
    supplierPerformance: calculateSupplierPerformance(orders),
    costTrends: calculateCostTrends(orders)
  };

  return {
    revenue: {
      total: calculateRevenue(orders),
      today: calculateRevenue(todayOrders),
      thisWeek: calculateRevenue(weekOrders),
      thisMonth: calculateRevenue(monthOrders),
      byPaymentMethod: revenueByPayment,
      byDay: revenueByDay,
      growth: {
        daily: calculateGrowthRate(todayOrders, orders),
        weekly: calculateGrowthRate(weekOrders, orders)
      }
    },
    orders: {
      total: orders.length,
      today: todayOrders.length,
      last24Hours: last24HourOrders.length,
      byStatus: ordersByStatus,
      byTimeOfDay: calculateOrdersByTimeOfDay(orders)
    },
    items: {
      popular: calculatePopularItems(orders),
      byTime: calculateItemsByTime(orders)
    },
    tables: calculateTableMetrics(orders),
    performance: {
      completionRate: calculateCompletionRate(orders),
      cancellationRate: calculateCancellationRate(orders),
      averageOrderValue: calculateAverageOrderValue(orders),
      peakHours: calculatePeakHours(orders)
    },
    itemAnalytics: {
      items: itemAnalytics,
      topPerformers,
      lowPerformers
    },
    inventory: {
      analytics: inventoryAnalytics
    }
  };
}

// Helper functions for calculations
function calculatePopularCombinations(orders: Order[], itemName: string) {
  const combinations: Record<string, number> = {};
  
  orders.forEach(order => {
    const hasItem = order.order_items.some(item => item.item_name === itemName);
    if (hasItem) {
      order.order_items.forEach(item => {
        if (item.item_name !== itemName) {
          combinations[item.item_name] = (combinations[item.item_name] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(combinations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([itemName, occurrences]) => ({ itemName, occurrences }));
}

function calculateCustomerFeedback(itemOrders: OrderItem[]) {
  const totalOrders = itemOrders.length;
  return {
    averageRating: 4.5, // Placeholder until we implement ratings
    totalRatings: totalOrders,
    ratingDistribution: {
      5: Math.floor(totalOrders * 0.45),
      4: Math.floor(totalOrders * 0.35),
      3: Math.floor(totalOrders * 0.13),
      2: Math.floor(totalOrders * 0.05),
      1: Math.floor(totalOrders * 0.02)
    }
  };
}

function calculateProfitMargin(menuItem: MenuItem, itemOrders: OrderItem[]) {
  // Placeholder until we implement cost tracking
  return 65;
}

function calculateWastageRate(menuItem: MenuItem, itemOrders: OrderItem[]) {
  // Placeholder until we implement waste tracking
  return 2;
}

function calculatePreparationTime(itemOrders: OrderItem[]) {
  // Placeholder until we implement preparation time tracking
  return 15;
}

function calculateLowStockItems(menuItems: MenuItem[], orders: Order[]) {
  // Example threshold calculation based on order frequency
  return menuItems
    .map(item => {
      const orderCount = orders.reduce((count, order) => {
        const orderItem = order.order_items.find(oi => oi.item_name === item.name);
        return count + (orderItem ? orderItem.quantity : 0);
      }, 0);

      const averageDaily = orderCount / 30; // Assuming 30 days of data
      const reorderPoint = Math.ceil(averageDaily * 3); // 3 days of stock

      return {
        name: item.name,
        quantity: Math.max(0, reorderPoint - orderCount),
        reorderPoint
      };
    })
    .filter(item => item.quantity <= item.reorderPoint)
    .slice(0, 5);
}

function calculateWastageAnalytics(menuItems: MenuItem[], orders: Order[]) {
  // Placeholder until we implement waste tracking
  return {
    totalWastage: 0,
    wastageByItem: [],
    wastageByReason: {}
  };
}

function calculateSupplierPerformance(orders: Order[]) {
  // Placeholder until we implement supplier tracking
  return [
    {
      name: 'Supplier 1',
      reliability: 95,
      averageDeliveryTime: 2,
      qualityRating: 4.5,
      totalOrders: 150
    },
    {
      name: 'Supplier 2',
      reliability: 92,
      averageDeliveryTime: 3,
      qualityRating: 4.2,
      totalOrders: 120
    }
  ];
}

function calculateCostTrends(orders: Order[]) {
  // Calculate daily cost trends for the last 30 days
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      totalCost: Math.random() * 1000 + 500 // Placeholder until we implement cost tracking
    };
  }).reverse();
}

function calculateGrowthRate(currentPeriod: Order[], previousPeriod: Order[]) {
  const currentRevenue = currentPeriod.reduce((sum, order) => sum + order.total_amount, 0);
  const previousRevenue = previousPeriod.reduce((sum, order) => sum + order.total_amount, 0);
  
  if (previousRevenue === 0) return 0;
  return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
}

function calculateOrdersByTimeOfDay(orders: Order[]) {
  return orders.reduce((acc, order) => {
    const hour = new Date(order.created_at).getHours();
    if (hour >= 6 && hour < 12) acc.morning++;
    else if (hour >= 12 && hour < 17) acc.afternoon++;
    else if (hour >= 17 && hour < 22) acc.evening++;
    else acc.night++;
    return acc;
  }, { morning: 0, afternoon: 0, evening: 0, night: 0 });
}

function calculatePopularItems(orders: Order[]) {
  const itemCounts: Record<string, { quantity: number; revenue: number }> = {};
  
  orders.forEach(order => {
    order.order_items.forEach(item => {
      if (!itemCounts[item.item_name]) {
        itemCounts[item.item_name] = { quantity: 0, revenue: 0 };
      }
      itemCounts[item.item_name].quantity += item.quantity;
      itemCounts[item.item_name].revenue += item.price * item.quantity;
    });
  });

  return Object.entries(itemCounts)
    .map(([name, { quantity, revenue }]) => ({
      name,
      quantity,
      revenue,
      averageOrderValue: revenue / quantity,
      peakHour: calculatePeakHourForItem(orders, name),
      completionRate: calculateCompletionRateForItem(orders, name)
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

function calculateItemsByTime(orders: Order[]) {
  const timeSlots = ['morning', 'afternoon', 'evening', 'night'];
  const itemsByTime: Record<string, { name: string; count: number }[]> = {};

  timeSlots.forEach(slot => {
    const slotOrders = orders.filter(order => {
      const hour = new Date(order.created_at).getHours();
      return (
        (slot === 'morning' && hour >= 6 && hour < 12) ||
        (slot === 'afternoon' && hour >= 12 && hour < 17) ||
        (slot === 'evening' && hour >= 17 && hour < 22) ||
        (slot === 'night' && (hour >= 22 || hour < 6))
      );
    });

    const itemCounts: Record<string, number> = {};
    slotOrders.forEach(order => {
      order.order_items.forEach(item => {
        itemCounts[item.item_name] = (itemCounts[item.item_name] || 0) + item.quantity;
      });
    });

    itemsByTime[slot] = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  return itemsByTime;
}

function calculateTableMetrics(orders: Order[]) {
  const tableOrders: Record<number, Order[]> = {};
  orders.forEach(order => {
    if (!tableOrders[order.table_number]) {
      tableOrders[order.table_number] = [];
    }
    tableOrders[order.table_number].push(order);
  });

  const metrics = Object.entries(tableOrders).map(([number, orders]) => ({
    number: parseInt(number),
    orders: orders.length,
    last24HourOrders: orders.filter(order => 
      new Date(order.created_at) >= subHours(new Date(), 24)
    ).length,
    averageOrderValue: orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length,
    turnoverRate: calculateTableTurnoverRate(orders)
  }));

  return {
    mostActive: metrics.sort((a, b) => b.orders - a.orders).slice(0, 5),
    averageOrderValue: metrics.map(m => ({ number: m.number, value: m.averageOrderValue })),
    turnoverRate: metrics.map(m => ({ number: m.number, rate: m.turnoverRate }))
  };
}

function calculateTableTurnoverRate(orders: Order[]) {
  const timeSpans = orders.map(order => {
    const orderTime = new Date(order.created_at).getTime();
    // Assume average dining time of 1 hour
    return { start: orderTime, end: orderTime + 3600000 };
  });

  // Calculate overlapping time periods
  let totalHours = 0;
  timeSpans.forEach((span, i) => {
    if (i > 0) {
      const gap = (span.start - timeSpans[i-1].end) / 3600000;
      if (gap > 0) totalHours += gap;
    }
  });

  return orders.length / (totalHours || 1);
}

function calculatePeakHourForItem(orders: Order[], itemName: string) {
  const hourCounts: Record<number, number> = {};
  
  orders.forEach(order => {
    const hasItem = order.order_items.some(item => item.item_name === itemName);
    if (hasItem) {
      const hour = new Date(order.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  return Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 0;
}

function calculateCompletionRateForItem(orders: Order[], itemName: string) {
  const itemOrders = orders.filter(order =>
    order.order_items.some(item => item.item_name === itemName)
  );

  const completed = itemOrders.filter(order => order.status === 'completed').length;
  return (completed / itemOrders.length) * 100;
}

function calculateCompletionRate(orders: Order[]) {
  const completed = orders.filter(order => order.status === 'completed').length;
  return (completed / orders.length) * 100;
}

function calculateCancellationRate(orders: Order[]) {
  const cancelled = orders.filter(order => order.status === 'cancelled').length;
  return (cancelled / orders.length) * 100;
}

function calculateAverageOrderValue(orders: Order[]) {
  return orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length;
}

function calculatePeakHours(orders: Order[]) {
  const hourCounts: Record<string, { orders: number; revenue: number }> = {};
  
  orders.forEach(order => {
    const hour = format(new Date(order.created_at), 'HH:00');
    if (!hourCounts[hour]) {
      hourCounts[hour] = { orders: 0, revenue: 0 };
    }
    hourCounts[hour].orders++;
    hourCounts[hour].revenue += order.total_amount;
  });

  return Object.entries(hourCounts)
    .map(([hour, data]) => ({
      hour,
      orders: data.orders,
      revenue: data.revenue
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 3);
}