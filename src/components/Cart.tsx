import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';

interface CartItem {
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}

interface CartProps {
  token: string;
  cartItems: CartItem[];
  onCartUpdate: () => void;
}

const Cart: React.FC<CartProps> = ({ token, cartItems, onCartUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  const updateQuantity = async (productId: number, quantity: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        onCartUpdate();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onCartUpdate();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onCartUpdate();
        alert('Order placed successfully!');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600">Start shopping to add items to your cart</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
        <span className="text-lg text-gray-600">{cartItems.length} items</span>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <div key={item.productId} className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-gray-600">${item.product.price}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={loading}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={loading}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    disabled={loading}
                    className="mt-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
          </div>
          
          <button
            onClick={placeOrder}
            disabled={placing}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {placing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <CreditCard className="h-5 w-5 mr-2" />
            )}
            {placing ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;