import React, { useState, useCallback, KeyboardEvent, useEffect } from 'react';
import { ShoppingCart, Lock, Phone, LayoutDashboard, Users, Settings, Menu as MenuIcon, Sun, Moon } from 'lucide-react';
import { useCartStore } from './store/cartStore';
import { useThemeStore } from './store/themeStore';
import toast, { Toaster } from 'react-hot-toast';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { OrderTracking } from './components/OrderTracking';
import { OwnerDashboard } from './components/OwnerDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo';
import { checkPassword, getStoredAuth, storeAuth, clearAuth, UserRole } from './lib/auth';

interface CartPreviewProps {
  item: { name: string; price: number; image: string };
  onClose: () => void;
  onViewCart: () => void;
}

function CartPreview({ item, onClose, onViewCart }: CartPreviewProps) {
  const handleKeyPress = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 right-4 bg-primary-800 rounded-lg shadow-premium p-4 z-50 max-w-sm w-full border border-primary-700"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white">{item.name} added to cart</h3>
          <p className="text-sm text-primary-300">₹{item.price}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={onClose}
          onKeyPress={handleKeyPress}
          className="px-3 py-1.5 text-sm text-primary-300 hover:text-white transition-colors"
        >
          Continue Shopping
        </button>
        <button
          onClick={onViewCart}
          onKeyPress={handleKeyPress}
          className="px-3 py-1.5 text-sm bg-accent-600 text-white rounded hover:bg-accent-700 transition-colors"
        >
          View Cart
        </button>
      </div>
    </motion.div>
  );
}

function App() {
  const [password, setPassword] = useState('');
  const [authState, setAuthState] = useState(() => getStoredAuth());
  const [currentPage, setCurrentPage] = useState<'menu' | 'cart' | 'owner' | 'track'>('menu');
  const [cartPreview, setCartPreview] = useState<{ name: string; price: number; image: string } | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addItem);
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const handleLogin = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const role = checkPassword(password);
    
    if (role) {
      const newAuthState = { role, isAuthenticated: true };
      setAuthState(newAuthState);
      storeAuth(newAuthState);
      setCurrentPage(role === 'owner' ? 'owner' : 'menu');
      toast.success(`Welcome, ${role === 'owner' ? 'Owner' : 'Employee'}!`);
      setPassword('');
    } else {
      toast.error('Invalid password');
    }
  }, [password]);

  const handleLogout = useCallback(() => {
    setAuthState({ role: null, isAuthenticated: false });
    clearAuth();
    setCurrentPage('menu');
    toast.success('Logged out successfully');
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }, [handleLogin]);

  const handleAddToCart = (item: { name: string; price: number; image: string }) => {
    addToCart(item);
    setCartPreview(item);
    setTimeout(() => setCartPreview(null), 3000);
  };

  const handleViewCart = useCallback(() => {
    setCartPreview(null);
    setCurrentPage('cart');
  }, []);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Menu', page: 'menu' },
    { icon: <ShoppingCart size={20} />, label: 'Cart', page: 'cart', count: cartItems.length },
    { icon: <Users size={20} />, label: 'Track Order', page: 'track' },
    ...(authState.isAuthenticated ? [{ icon: <Settings size={20} />, label: 'Dashboard', page: 'owner' }] : []),
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-primary-900' : 'bg-gray-50'} flex`}>
      <Toaster position="top-center" />
      
      <AnimatePresence>
        {cartPreview && (
          <CartPreview
            item={cartPreview}
            onClose={() => setCartPreview(null)}
            onViewCart={handleViewCart}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {!isMobile && (
        <div className={`w-64 shrink-0 ${theme === 'dark' ? 'bg-primary-800 border-primary-700' : 'bg-white border-gray-200'} border-r shadow-premium`}>
          <div className="p-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('menu')}>
              <Logo className="w-8 h-8" />
              <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>C Square</h1>
            </div>
          </div>
          <nav className="mt-6">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  setCurrentPage(item.page as any);
                  setShowSidebar(false);
                }}
                onKeyPress={(e) => e.key === 'Enter' && setCurrentPage(item.page as any)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  currentPage === item.page
                    ? `${theme === 'dark' ? 'bg-primary-700 text-accent-400 border-accent-500' : 'bg-gray-100 text-accent-600 border-accent-500'} border-r-4`
                    : `${theme === 'dark' ? 'text-primary-300 hover:bg-primary-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span className="ml-auto bg-accent-600 text-white px-2 py-0.5 rounded-full text-xs">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
            {!authState.isAuthenticated ? (
              <div className="px-6 py-3 space-y-2">
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`w-full p-2 text-sm ${
                    theme === 'dark' 
                      ? 'bg-primary-700 border-primary-600 text-white placeholder-primary-400' 
                      : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'
                  } border rounded focus:ring-2 focus:ring-accent-500 focus:border-transparent`}
                />
                <button
                  onClick={handleLogin}
                  className={`w-full p-2 text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-accent-600 text-white hover:bg-accent-500'
                      : 'bg-accent-500 text-white hover:bg-accent-600'
                  } rounded transition-colors`}
                >
                  Login to Dashboard
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium ${
                  theme === 'dark'
                    ? 'text-red-400 hover:bg-primary-700'
                    : 'text-red-600 hover:bg-gray-100'
                } transition-colors`}
              >
                <Lock size={20} />
                <span>Logout</span>
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className={`${theme === 'dark' ? 'bg-primary-800 border-primary-700' : 'bg-white border-gray-200'} border-b h-16 flex items-center px-6 shrink-0`}>
          {isMobile && (
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`mr-4 ${theme === 'dark' ? 'text-white hover:text-accent-400' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <MenuIcon size={24} />
            </button>
          )}
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {currentPage === 'menu' && 'Menu'}
            {currentPage === 'cart' && 'Cart'}
            {currentPage === 'track' && 'Order Tracking'}
            {currentPage === 'owner' && 'Dashboard'}
          </h2>
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                theme === 'dark'
                  ? 'text-yellow-400 hover:bg-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <a
              href="tel:8209349602"
              className={`flex items-center gap-2 ${
                theme === 'dark'
                  ? 'text-accent-400 hover:text-accent-300'
                  : 'text-accent-600 hover:text-accent-700'
              }`}
            >
              <Phone size={20} />
              <span className="text-sm font-medium">+91 8209349602</span>
            </a>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="h-full">
            {currentPage === 'menu' && <Menu onAddToCart={handleAddToCart} />}
            {currentPage === 'cart' && <Cart />}
            {currentPage === 'track' && <OrderTracking />}
            {currentPage === 'owner' && authState.isAuthenticated && (
              <OwnerDashboard userRole={authState.role} />
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className={`${theme === 'dark' ? 'bg-primary-800 border-primary-700' : 'bg-white border-gray-200'} border-t h-16 fixed bottom-0 left-0 right-0 z-50`}>
            <div className="flex justify-around items-center h-full px-2">
              {menuItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page as any)}
                  className={`flex flex-col items-center justify-center w-full h-full ${
                    currentPage === item.page
                      ? theme === 'dark' ? 'text-accent-400' : 'text-accent-600'
                      : theme === 'dark' ? 'text-primary-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="relative">
                    {item.icon}
                    {item.count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-accent-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

export default App;