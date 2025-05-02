import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MenuSection } from './MenuSection';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface MenuCategory {
  id: string;
  title: string;
  note: string | null;
  order: number;
  menu_items: MenuItem[];
}

interface MenuProps {
  onAddToCart: (item: { name: string; price: number; image: string }) => void;
}

export function Menu({ onAddToCart }: MenuProps) {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu_categories')
      .select(`
        id,
        title,
        note,
        order,
        menu_items (
          id,
          name,
          price,
          image_url,
          order
        )
      `)
      .order('order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch menu');
      console.error(error);
    } else {
      setMenuCategories(data || []);
    }
    setLoading(false);
  };

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  if (loading) {
    return <div className="text-center">Loading menu...</div>;
  }

  return (
    <div className="space-y-6">
      {menuCategories.map((category) => (
        <MenuSection
          key={category.id}
          title={category.title}
          items={category.menu_items.map(item => ({
            name: item.name,
            price: item.price,
            image: item.image_url
          }))}
          note={category.note}
          isExpanded={expandedSection === category.title}
          onToggle={() => toggleSection(category.title)}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}