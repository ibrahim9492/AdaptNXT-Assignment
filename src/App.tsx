import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, LogOut, Package, Plus, Search, Filter } from 'lucide-react';
import Login from './components/Login';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Orders from './components/Orders';
import AdminPanel from './components/AdminPanel';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'products' | 'cart' | 'orders' | 'admin'>('products');
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData.user);
    setToken(userData.token);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('products');
  };

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-slate-900">E-Commerce Store</h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('products')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'products'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Products
              </button>
              
              <button
                onClick={() => setCurrentView('cart')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  currentView === 'cart'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cartItems.length})
              </button>
              
              <button
                onClick={() => setCurrentView('orders')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'orders'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Orders
              </button>
              
              {user.role === 'admin' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  Admin
                </button>
              )}
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-slate-600" />
                <span className="text-slate-700 font-medium">{user.username}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'products' && (
          <ProductList token={token} onCartUpdate={fetchCart} />
        )}
        
        {currentView === 'cart' && (
          <Cart token={token} cartItems={cartItems} onCartUpdate={fetchCart} />
        )}
        
        {currentView === 'orders' && (
          <Orders token={token} />
        )}
        
        {currentView === 'admin' && user.role === 'admin' && (
          <AdminPanel token={token} />
        )}
      </main>
    </div>
  );
}

export default App;