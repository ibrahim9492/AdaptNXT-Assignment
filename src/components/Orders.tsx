import React, { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, ShoppingBag } from 'lucide-react';

interface Order {
  id: number;
  userId: number;
  items: Array<{
    productId: number;
    productName: string;
    price: number;
    quantity: number;
  }>;
  total: string;
  status: string;
  createdAt: string;
}

interface OrdersProps {
  token: string;
}

const Orders: React.FC<OrdersProps> = ({ token }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-600">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
        <span className="text-lg text-gray-600">{orders.length} orders</span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${order.total}
                    </div>
                  </div>
                </div>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Items:</h4>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <ShoppingBag className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{item.productName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600">Qty: {item.quantity}</span>
                    <span className="ml-4 font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;