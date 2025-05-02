import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, History, AlertTriangle, TrendingUp, RefreshCw, Filter, Search } from 'lucide-react';
import { fetchInventoryItems, fetchInventoryTransactions, updateInventoryItem, createInventoryTransaction } from '../../lib/inventory';
import { InventoryItem, InventoryTransaction } from '../../lib/types';
import { formatCurrency } from '../../lib/notification';
import toast from 'react-hot-toast';

interface InventoryManagementProps {
  isViewer: boolean;
}

export function InventoryManagement({ isViewer }: InventoryManagementProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'category'>('name');
  const [transactionData, setTransactionData] = useState({
    type: 'restock' as const,
    quantity: '',
    cost: '',
    notes: ''
  });
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    quantity: '0',
    unit: '',
    min_quantity: '0',
    category: '',
    supplier: '',
    cost_per_unit: '0',
    location: '',
    reorder_quantity: '0'
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [itemsData, transactionsData] = await Promise.all([
        fetchInventoryItems(),
        fetchInventoryTransactions()
      ]);
      setItems(itemsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      toast.error('Viewers cannot modify inventory');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{
          ...itemFormData,
          quantity: parseInt(itemFormData.quantity),
          min_quantity: parseInt(itemFormData.min_quantity),
          cost_per_unit: parseFloat(itemFormData.cost_per_unit),
          reorder_quantity: parseInt(itemFormData.reorder_quantity)
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Item created successfully');
      setItems(prev => [...prev, data]);
      setShowItemForm(false);
      setItemFormData({
        name: '',
        description: '',
        quantity: '0',
        unit: '',
        min_quantity: '0',
        category: '',
        supplier: '',
        cost_per_unit: '0',
        location: '',
        reorder_quantity: '0'
      });
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
    }
  };

  const handleUpdateStock = async (item: InventoryItem, newQuantity: number) => {
    if (isViewer) {
      toast.error('Viewers cannot modify inventory');
      return;
    }

    try {
      const transaction = {
        item_id: item.id,
        type: newQuantity > item.quantity ? 'restock' : 'usage',
        quantity_change: Math.abs(newQuantity - item.quantity),
        previous_quantity: item.quantity,
        new_quantity: newQuantity,
        unit_cost: item.cost_per_unit,
        notes: `Stock ${newQuantity > item.quantity ? 'increased' : 'decreased'} by ${Math.abs(newQuantity - item.quantity)} ${item.unit}`
      };

      await Promise.all([
        updateInventoryItem(item.id, { quantity: newQuantity }),
        createInventoryTransaction(transaction)
      ]);

      toast.success('Inventory updated successfully');
      loadInventoryData();
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
    }
  };

  const filteredItems = items
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(item => categoryFilter === 'all' || item.category === categoryFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });

  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  if (loading) {
    return <div className="text-center text-primary-300">Loading inventory data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-primary-400"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-primary-700/50 border border-primary-600 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'quantity' | 'category')}
          className="bg-primary-700/50 border border-primary-600 rounded-lg px-4 py-2 text-white"
        >
          <option value="name">Sort by Name</option>
          <option value="quantity">Sort by Quantity</option>
          <option value="category">Sort by Category</option>
        </select>
        {!isViewer && (
          <button
            onClick={() => setShowItemForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-500 transition-colors"
          >
            <Plus size={20} />
            Add Item
          </button>
        )}
      </div>

      {/* Item Form Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6 max-w-2xl w-full">
            <h3 className="text-xl font-semibold mb-4 text-white">Add New Item</h3>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Initial Quantity
                  </label>
                  <input
                    type="number"
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Minimum Quantity
                  </label>
                  <input
                    type="number"
                    value={itemFormData.min_quantity}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, min_quantity: e.target.value }))}
                    className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Reorder Quantity
                  </label>
                  <input
                    type="number"
                    value={itemFormData.reorder_quantity}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, reorder_quantity: e.target.value }))}
                    className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Cost per Unit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemFormData.cost_per_unit}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, cost_per_unit: e.target.value }))}
                    className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={itemFormData.supplier}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={itemFormData.location}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Description
                </label>
                <textarea
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowItemForm(false)}
                  className="px-4 py-2 bg-primary-700 text-primary-300 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-500 transition-colors"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-700/50 rounded-lg p-4 border border-primary-600/50"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-white">{item.name}</h3>
                {item.category && (
                  <p className="text-sm text-primary-300">{item.category}</p>
                )}
              </div>
              {!isViewer && (
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setShowTransactionForm(true);
                  }}
                  className="p-2 bg-accent-600/20 text-accent-400 rounded-full hover:bg-accent-600/30 transition-colors"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-primary-300">Current Stock</span>
                <span className={`font-medium ${
                  item.quantity <= item.min_quantity 
                    ? 'text-red-400' 
                    : 'text-accent-400'
                }`}>
                  {item.quantity} {item.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-300">Minimum Stock</span>
                <span className="text-primary-400">{item.min_quantity} {item.unit}</span>
              </div>
              {item.supplier && (
                <div className="flex justify-between text-sm">
                  <span className="text-primary-300">Supplier</span>
                  <span className="text-primary-400">{item.supplier}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-primary-300">Value</span>
                <span className="text-accent-400">
                  {formatCurrency(item.quantity * item.cost_per_unit)}
                </span>
              </div>
            </div>

            {!isViewer && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleUpdateStock(item, item.quantity - 1)}
                  className="flex-1 px-3 py-1.5 bg-primary-600/50 text-primary-300 rounded hover:bg-primary-600 transition-colors"
                >
                  -1
                </button>
                <button
                  onClick={() => handleUpdateStock(item, item.quantity + 1)}
                  className="flex-1 px-3 py-1.5 bg-primary-600/50 text-primary-300 rounded hover:bg-primary-600 transition-colors"
                >
                  +1
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Record Transaction: {selectedItem.name}
            </h3>
            <form onSubmit={handleTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Transaction Type
                </label>
                <select
                  value={transactionData.type}
                  onChange={(e) => setTransactionData(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'restock' | 'usage' | 'waste' | 'adjustment'
                  }))}
                  className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                >
                  <option value="restock">Restock</option>
                  <option value="usage">Usage</option>
                  <option value="waste">Waste</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Quantity ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  value={transactionData.quantity}
                  onChange={(e) => setTransactionData(prev => ({ 
                    ...prev, 
                    quantity: e.target.value
                  }))}
                  className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Cost
                </label>
                <input
                  type="number"
                  value={transactionData.cost}
                  onChange={(e) => setTransactionData(prev => ({ 
                    ...prev, 
                    cost: e.target.value
                  }))}
                  className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={transactionData.notes}
                  onChange={(e) => setTransactionData(prev => ({ 
                    ...prev, 
                    notes: e.target.value
                  }))}
                  className="w-full p-2 bg-primary-700/50 border border-primary-600 rounded-lg text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="px-4 py-2 bg-primary-700 text-primary-300 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-500 transition-colors"
                >
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}