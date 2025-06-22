import { useState, useEffect } from 'react';
import type { MenuItem } from '../types';
import menuData from '../data/menu.json';

interface OrderItem extends MenuItem {
  quantity: number;
}

const OrderPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Flatten menu items from categories
  useEffect(() => {
    const items = menuData.categories.flatMap(category => 
      category.items.map(item => ({
        ...item,
        category: category.name
      }))
    );
    setMenuItems(items);
  }, []);

  // Filter menu items based on search and category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add item to order
  const addToOrder = (item: MenuItem) => {
    setOrderItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Update item quantity
  const updateQuantity = (itemId: string, delta: number) => {
    setOrderItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as OrderItem[]
    );
  };

  // Remove item from order
  const removeFromOrder = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculate total price
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Menu Section */}
        <div className="lg:w-2/3">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              className="w-full p-3 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mb-6 flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              Tất cả
            </button>
            {menuData.categories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-lg ${
                  selectedCategory === category.name ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">{item.price.toLocaleString()}đ</p>
                </div>
                <button
                  onClick={() => addToOrder(item)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Thêm
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Đơn hàng</h2>
            
            {orderItems.length === 0 ? (
              <p className="text-gray-500">Chưa có món ăn nào được chọn</p>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-gray-600">{item.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromOrder(item.id)}
                          className="text-red-500 ml-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Tổng cộng:</span>
                    <span>{totalPrice.toLocaleString()}đ</span>
                  </div>
                </div>

                <button
                  className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                >
                  Xác nhận đơn hàng
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage; 