import { create } from 'zustand';
import { MenuItem } from '../menuData';

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemName: string) => void;
  updateQuantity: (itemName: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.name === item.name);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.name === item.name
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    });
  },
  removeItem: (itemName) => {
    set((state) => ({
      items: state.items.filter((i) => i.name !== itemName),
    }));
  },
  updateQuantity: (itemName, quantity) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.name === itemName ? { ...i, quantity } : i
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  total: () => {
    const items = get().items;
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
}));