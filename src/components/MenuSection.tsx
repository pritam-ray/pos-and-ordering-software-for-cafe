import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { formatCurrency } from '../lib/notification';
import { MenuItem } from '../menuData';

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  note?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  title,
  items,
  note,
  isExpanded,
  onToggle,
  onAddToCart,
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className="bg-primary-800/50 backdrop-blur-lg rounded-lg shadow-premium border border-primary-700/50 overflow-hidden"
    >
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center bg-gradient-to-r from-primary-800/80 to-primary-700/80 border-b border-primary-600/50"
        onClick={onToggle}
      >
        <span className="text-xl font-semibold text-accent-400">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-accent-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-accent-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.name}
              variants={itemVariants}
              className="flex items-center gap-4 p-3 hover:bg-primary-700/50 rounded-lg transition-colors border border-primary-700/30"
            >
              <div className="relative w-20 h-20 overflow-hidden rounded-lg shadow-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{item.name}</h3>
                <p className="text-accent-400 font-medium">{formatCurrency(item.price)}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddToCart(item)}
                className="bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-500 transition-colors shadow-lg"
              >
                Add
              </motion.button>
            </motion.div>
          ))}
          {note && (
            <p className="text-sm text-primary-300 mt-2 italic border-t border-primary-700/30 pt-4">
              {note}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};