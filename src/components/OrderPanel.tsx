import React, { useState } from 'react';
import type { OrderItem } from '../types/table';

interface OrderPanelProps {
  currentOrders: OrderItem[];
  onUpdateOrder: (items: OrderItem[]) => void;
}

const OrderPanel: React.FC<OrderPanelProps> = ({ currentOrders, onUpdateOrder }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingOrders, setPendingOrders] = useState<OrderItem[]>([]);

  // Danh sách menu mẫu (sau này có thể tải từ API)
  const menuItems = [
    { id: '1', name: 'Gỏi cuốn', price: 45000, category: 'Khai vị' },
    { id: '2', name: 'Chả giò', price: 55000, category: 'Khai vị' },
    { id: '3', name: 'Cơm sườn', price: 75000, category: 'Món chính' },
    { id: '4', name: 'Phở bò', price: 85000, category: 'Món chính' },
    { id: '5', name: 'Coca Cola', price: 25000, category: 'Đồ uống' },
    { id: '6', name: 'Bia Sài Gòn', price: 30000, category: 'Đồ uống' },
  ];

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = (menuItem: typeof menuItems[0]) => {
    const existingItemIndex = pendingOrders.findIndex(item => item.id === menuItem.id);
    
    if (existingItemIndex >= 0) {
      const updatedOrders = [...pendingOrders];
      updatedOrders[existingItemIndex].quantity += 1;
      setPendingOrders(updatedOrders);
    } else {
      setPendingOrders([...pendingOrders, { ...menuItem, quantity: 1, notes: '' }]);
    }
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setPendingOrders(prevOrders => 
      prevOrders.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as OrderItem[]
    );
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setPendingOrders(prevOrders =>
      prevOrders.map(item =>
        item.id === itemId ? { ...item, notes } : item
      )
    );
  };

  const handleConfirmOrder = () => {
    const updatedOrders = [...currentOrders];
    
    pendingOrders.forEach(pendingItem => {
      const existingIndex = updatedOrders.findIndex(item => item.id === pendingItem.id);
      if (existingIndex >= 0) {
        updatedOrders[existingIndex].quantity += pendingItem.quantity;
        updatedOrders[existingIndex].notes = pendingItem.notes || updatedOrders[existingIndex].notes;
      } else {
        updatedOrders.push(pendingItem);
      }
    });

    onUpdateOrder(updatedOrders);
    setPendingOrders([]);
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <div className="flex h-full">
      {/* Menu Panel */}
      <div className="w-2/3 p-4 bg-white rounded-l-lg shadow">
        <div className="mb-4 space-y-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Tìm món..."
            className="w-full p-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'Tất cả' : category}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleAddItem(item)}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow text-left"
              >
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.category}</p>
                <p className="text-blue-600 font-medium mt-2">
                  {item.price.toLocaleString()}đ
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary Panel */}
      <div className="w-1/3 bg-gray-50 p-4 rounded-r-lg">
        <h2 className="text-xl font-bold mb-4">Đơn hàng mới</h2>
        
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {pendingOrders.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{item.name}</h3>
                <span className="text-blue-600">
                  {(item.price * item.quantity).toLocaleString()}đ
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => handleUpdateQuantity(item.id, -1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">
                  x {item.price.toLocaleString()}đ
                </span>
              </div>

              <input
                type="text"
                placeholder="Ghi chú..."
                value={item.notes || ''}
                onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                className="w-full p-2 text-sm border rounded"
              />
            </div>
          ))}
        </div>

        {pendingOrders.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Tổng cộng:</span>
              <span>{calculateTotal(pendingOrders).toLocaleString()}đ</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPendingOrders([])}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmOrder}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Xác nhận
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPanel; 