import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserRole } from '../lib/auth';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
  order?: number;
}

interface Category {
  id: string;
  title: string;
  note: string | null;
  order: number;
}

export function MenuManagement({ userRole }: { userRole: UserRole }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image_url: '',
    category_id: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    title: '',
    note: '',
    order: 0
  });
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('order');

    if (error) {
      toast.error('Failed to fetch menu items');
    } else {
      setMenuItems(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('order');

    if (error) {
      toast.error('Failed to fetch categories');
    } else {
      setCategories(data || []);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter item name');
      return false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      toast.error('Please enter a valid price');
      return false;
    }
    if (!formData.image_url.trim()) {
      toast.error('Please enter image URL');
      return false;
    }
    if (!formData.category_id) {
      toast.error('Please select a category');
      return false;
    }
    return true;
  };

  const validateCategoryForm = () => {
    if (!categoryFormData.title.trim()) {
      toast.error('Please enter category title');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image_url: '',
      category_id: ''
    });
    setEditingItem(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      title: '',
      note: '',
      order: categories.length
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const item = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      image_url: formData.image_url.trim(),
      category_id: formData.category_id,
      order: menuItems.length + 1
    };

    try {
      if (isViewer) {
        const fakeItem = {
          id: `temp-${Date.now()}`,
          ...item
        };
        
        if (editingItem) {
          setMenuItems(prev => prev.map(i => i.id === editingItem.id ? fakeItem : i));
          toast.success('Item updated successfully');
        } else {
          setMenuItems(prev => [...prev, fakeItem]);
          toast.success('Item added successfully');
        }
        resetForm();
        return;
      }

      if (editingItem) {
        const { data, error } = await supabase
          .from('menu_items')
          .update(item)
          .eq('id', editingItem.id)
          .select()
          .single();

        if (error) throw error;
        toast.success('Item updated successfully');
        setMenuItems(prev => prev.map(i => i.id === editingItem.id ? data : i));
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert([item])
          .select()
          .single();

        if (error) throw error;
        toast.success('Item added successfully');
        setMenuItems(prev => [...prev, data]);
      }

      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingItem ? 'Failed to update item' : 'Failed to add item');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCategoryForm()) {
      return;
    }

    const category = {
      title: categoryFormData.title.trim(),
      note: categoryFormData.note.trim() || null,
      order: editingCategory ? categoryFormData.order : categories.length + 1
    };

    try {
      if (isViewer) {
        const fakeCategory = {
          id: `temp-${Date.now()}`,
          ...category
        };
        
        if (editingCategory) {
          setCategories(prev => prev.map(c => c.id === editingCategory.id ? fakeCategory : c));
          toast.success('Category updated successfully');
        } else {
          setCategories(prev => [...prev, fakeCategory]);
          toast.success('Category added successfully');
        }
        resetCategoryForm();
        return;
      }

      if (editingCategory) {
        const { data, error } = await supabase
          .from('menu_categories')
          .update(category)
          .eq('id', editingCategory.id)
          .select()
          .single();

        if (error) throw error;
        toast.success('Category updated successfully');
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? data : c));
      } else {
        const { data, error } = await supabase
          .from('menu_categories')
          .insert([category])
          .select()
          .single();

        if (error) throw error;
        toast.success('Category added successfully');
        setCategories(prev => [...prev, data]);
      }

      resetCategoryForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to add category');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      image_url: item.image_url,
      category_id: item.category_id
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      title: category.title,
      note: category.note || '',
      order: category.order
    });
    setShowCategoryForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (isViewer) {
        setMenuItems(prev => prev.filter(item => item.id !== id));
        toast.success('Item deleted successfully');
        return;
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All items in this category will also be deleted.')) return;

    try {
      if (isViewer) {
        setCategories(prev => prev.filter(category => category.id !== id));
        setMenuItems(prev => prev.filter(item => item.category_id !== id));
        toast.success('Category deleted successfully');
        return;
      }

      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(prev => prev.filter(category => category.id !== id));
      setMenuItems(prev => prev.filter(item => item.category_id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete category');
    }
  };

  const isViewer = userRole === 'viewer';

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Menu Categories</h2>
          {!isViewer && (
            <button
              onClick={() => setShowCategoryForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-500 transition-colors"
            >
              <Plus size={20} />
              Add Category
            </button>
          )}
        </div>

        {showCategoryForm && (
          <form onSubmit={handleCategorySubmit} className="mb-6 bg-primary-700/50 rounded-lg p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Category Title
                </label>
                <input
                  type="text"
                  value={categoryFormData.title}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 bg-primary-800/50 border border-primary-600 rounded-lg text-white placeholder-primary-400"
                  placeholder="Enter category title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={categoryFormData.note}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full p-2 bg-primary-800/50 border border-primary-600 rounded-lg text-white placeholder-primary-400"
                  placeholder="Enter category note"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="px-4 py-2 bg-primary-700 text-primary-300 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-500 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-primary-700/50 rounded-lg p-4 border border-primary-600/50"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-white">{category.title}</h3>
                {!isViewer && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1 text-primary-300 hover:text-white transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              {category.note && (
                <p className="text-sm text-primary-300">{category.note}</p>
              )}
              <p className="text-sm text-primary-400 mt-2">
                {menuItems.filter(item => item.category_id === category.id).length} items
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Menu Items</h2>
        </div>

        {/* Add/Edit Item Form */}
        <form onSubmit={handleSubmit} className="mb-6 bg-primary-700/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 bg-primary-800/50 border border-primary-600 rounded-lg text-white placeholder-primary-400"
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Price
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full p-2 bg-primary-800/50 border border-primary-600 rounded-lg text-white placeholder-primary-400"
                placeholder="Enter price"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="w-full p-2 bg-primary-800/50 border border-primary-600 rounded-lg text-white placeholder-primary-400"
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full p-2 bg-primary-800/50 border border-primary-600 rounded-lg text-white"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!isViewer && (
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-primary-700 text-primary-300 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-500 transition-colors"
              >
                {editingItem ? 'Update' : 'Add'} Item
              </button>
            </div>
          )}
        </form>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary-700/50 rounded-lg overflow-hidden border border-primary-600/50"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <p className="text-accent-400">₹{item.price}</p>
                  </div>
                  {!isViewer && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-primary-300 hover:text-white transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-primary-300 mt-2">
                  {categories.find(c => c.id === item.category_id)?.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}