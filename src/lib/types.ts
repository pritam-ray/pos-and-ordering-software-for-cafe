export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minimum_stock: number;
  cost_per_unit: number;
  last_restocked: string;
  supplier: string;
  category: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemAnalytics {
  id: string;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularCombinations: Array<{
    itemName: string;
    occurrences: number;
  }>;
  ordersByTimeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  salesTrend: Array<{
    date: string;
    quantity: number;
    revenue: number;
  }>;
  customerFeedback: {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: Record<number, number>;
  };
  profitMargin: number;
  wastageRate: number;
  preparationTime: number;
}

export interface InventoryAnalytics {
  totalItems: number;
  totalValue: number;
  lowStockItems: Array<{
    name: string;
    quantity: number;
    reorderPoint: number;
  }>;
  expiringItems: Array<{
    name: string;
    quantity: number;
    expiryDate: string;
  }>;
  restockHistory: Array<{
    date: string;
    itemName: string;
    quantity: number;
    cost: number;
  }>;
  wastageAnalytics: {
    totalWastage: number;
    wastageByItem: Array<{
      name: string;
      quantity: number;
      cost: number;
    }>;
    wastageByReason: Record<string, number>;
  };
  supplierPerformance: Array<{
    name: string;
    reliability: number;
    averageDeliveryTime: number;
    qualityRating: number;
    totalOrders: number;
  }>;
  costTrends: Array<{
    date: string;
    totalCost: number;
    itemsCost: Record<string, number>;
  }>;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  type: 'restock' | 'usage' | 'waste' | 'adjustment';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  cost: number;
  notes: string | null;
  performed_by: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Order {
  id: string;
  table_number: number;
  customer_name: string;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  payment_method: 'cash' | 'online';
  total_amount: number;
  created_at: string;
  order_items?: OrderItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
  order?: number;
}

export interface MenuCategory {
  id: string;
  title: string;
  note: string | null;
  order: number;
  created_at?: string;
}

export interface Analytics {
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    last24Hours: number;
    byPaymentMethod: {
      cash: number;
      online: number;
    };
    byHour: { hour: string; amount: number; orders: number }[];
    byDay: { date: string; amount: number }[];
    growth: {
      daily: number;
      weekly: number;
    };
  };
  orders: {
    total: number;
    today: number;
    last24Hours: number;
    pending: number;
    preparing: number;
    completed: number;
    cancelled: number;
    averageTime: number;
    byStatus: { status: string; count: number; revenue: number }[];
    byHour: { hour: string; count: number }[];
    byTimeOfDay: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number;
    };
  };
  items: {
    popular: {
      name: string;
      quantity: number;
      revenue: number;
      averageOrderValue: number;
      peakHour: number;
      completionRate: number;
    }[];
    byTime: {
      morning: { name: string; count: number }[];
      afternoon: { name: string; count: number }[];
      evening: { name: string; count: number }[];
      night: { name: string; count: number }[];
    };
  };
  tables: {
    mostActive: { number: number; orders: number; last24HourOrders: number }[];
    averageOrderValue: { number: number; value: number }[];
    turnoverRate: { number: number; rate: number }[];
    peakHours: { number: number; peaks: { hour: number; orders: number }[] }[];
  };
  performance: {
    completionRate: number;
    cancellationRate: number;
    averageOrderValue: number;
    peakHours: { hour: string; orders: number; revenue: number }[];
  };
  itemAnalytics: {
    items: Record<string, ItemAnalytics>;
    topPerformers: Array<{
      id: string;
      name: string;
      revenue: number;
      quantity: number;
    }>;
    lowPerformers: Array<{
      id: string;
      name: string;
      revenue: number;
      quantity: number;
    }>;
  };
  inventory: {
    current: Record<string, InventoryItem>;
    analytics: InventoryAnalytics;
    alerts: Array<{
      type: 'low_stock' | 'expiring' | 'overstock' | 'price_change';
      itemName: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
}

export interface TableAnalytics {
  number: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularItems: { name: string; quantity: number }[];
  peakHours: { hour: number; orders: number }[];
}

export interface TableOrder extends Order {
  order_items: OrderItem[];
}