import React, { useState, useEffect } from 'react';
import type { OrderItem } from '../types/table';
import type { MenuItem } from '../types/menu';
import MenuService from '../services/menuService';
import ConfirmationModal from './ConfirmationModal';

interface OrderItemsPanelProps {
  initialItems: OrderItem[];
  onUpdateOrder: (items: OrderItem[]) => void;
  isServing: boolean;
}

const OrderItemsPanel: React.FC<OrderItemsPanelProps> = ({
  initialItems,
  onUpdateOrder,
  isServing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [pendingChanges, setPendingChanges] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const menuService = MenuService.getInstance();

  // Effect for loading menu data from the service
  useEffect(() => {
    const loadMenuData = () => {
      const availableMenuItems = menuService.getAvailableMenuItems();
      const allCategories = menuService.getAllCategories();
      setMenuItems(availableMenuItems);
      setCategories(allCategories);
    };
    
    loadMenuData();
    const unsubscribe = menuService.subscribe(loadMenuData);
    return unsubscribe;
  }, []);

  // Effect for syncing quantities when the table's order changes
  useEffect(() => {
    const newQuantities: { [key: string]: number } = {};
    // First, create a map of all available menu items with quantity 0
    menuItems.forEach(item => {
      newQuantities[item.id] = 0;
    });
    // Then, overlay the quantities from the actual order
    initialItems.forEach(item => {
      newQuantities[item.id] = item.quantity;
    });
    setQuantities(newQuantities);
    setPendingChanges(false); // Reset pending changes on prop update
  }, [initialItems, menuItems]);


  const categoryOptions = ['all', ...categories.map(cat => cat.id)];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, newQuantity),
    }));
    setPendingChanges(true);
  };

  const handleConfirmChanges = () => {
    setShowConfirm(true);
  };

  const handleConfirmOrder = () => {
    const updatedItems = menuItems
      .filter(menuItem => quantities[menuItem.id] > 0)
      .map(menuItem => ({
        id: menuItem.id,
        name: menuItem.name,
        quantity: quantities[menuItem.id],
        price: menuItem.price,
        category: categories.find(cat => cat.id === menuItem.categoryId)?.name || 'Không xác định',
        images: menuItem.images || [],
      }));

    onUpdateOrder(updatedItems);
    setPendingChanges(false);
  };

  const pendingTotal = menuItems
    .filter(menuItem => quantities[menuItem.id] > 0)
    .reduce((sum, menuItem) => sum + menuItem.price * quantities[menuItem.id], 0);

  const getNewItemsSummary = () => {
    const newItems = menuItems.filter(item => quantities[item.id] > 0);
    if (newItems.length === 0) return '';
    
    const itemList = newItems
      .map(item => `${item.name} x${quantities[item.id]}`)
      .join(', ');
    
    return itemList.length > 100 ? itemList.substring(0, 100) + '...' : itemList;
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Không xác định';
  };

  return (
    <>
      <div className="flex flex-row h-full"> {/* Changed to flex-row */}
        
        {/* Left Column: Menu Browsing */}
        <div className="flex-1 flex flex-col border-r">
          {/* Search and Category Filter */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Tìm món..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg mb-2"
            />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categoryOptions.map(categoryId => (
                <button
                  key={categoryId}
                  onClick={() => setSelectedCategory(categoryId)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap ${
                    selectedCategory === categoryId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoryId === 'all' ? 'Tất cả' : getCategoryName(categoryId)}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border hover:border-blue-500 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Food Image */}
                    <div className="flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Food Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-sm font-medium text-blue-600 mt-1">
                            {item.price.toLocaleString()}đ
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 0) - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{quantities[item.id] || 0}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 0) + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary and Actions */}
        <div className="w-1/3 flex flex-col bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Current Order */}
              <div>
                <h3 className="font-semibold mb-2">Món đã chọn</h3>
                <div className="space-y-2 mb-4">
                  {initialItems.length > 0 ? (
                    initialItems.map(item => {
                      // Find the menu item to get image
                      const menuItem = menuItems.find(menu => menu.id === item.id);
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                          {/* Food Image */}
                          <div className="flex-shrink-0">
                            {menuItem?.images && menuItem.images.length > 0 ? (
                              <img
                                src={menuItem.images[0]}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium text-sm">{item.name}</span>
                                <span className="text-gray-600 text-sm ml-2">x{item.quantity}</span>
                              </div>
                              <span className="font-semibold text-sm">{(item.price * item.quantity).toLocaleString()}đ</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-4">Chưa có món nào được chọn.</div>
                  )}
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Tổng hiện tại</span>
                    <span>
                      {initialItems
                        .reduce((sum, item) => sum + item.price * item.quantity, 0)
                        .toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending Changes */}
              {pendingChanges && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-700">Thay đổi mới</h3>
                  <div className="space-y-2 mb-4">
                    {menuItems
                      .filter(item => quantities[item.id] > 0)
                      .map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                          {/* Food Image */}
                          <div className="flex-shrink-0">
                            {item.images && item.images.length > 0 ? (
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium text-sm">{item.name}</span>
                                <span className="text-blue-600 text-sm ml-2">x{quantities[item.id]}</span>
                              </div>
                              <span className="font-semibold text-sm text-blue-700">{(item.price * quantities[item.id]).toLocaleString()}đ</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-blue-700">
                      <span>Tổng mới</span>
                      <span>{pendingTotal.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 flex gap-2 border-t">
              {pendingChanges ? (
                <>
                  <button
                    onClick={() => {
                      const newQuantities: { [key: string]: number } = {};
                      initialItems.forEach(item => {
                        newQuantities[item.id] = item.quantity;
                      });
                      setQuantities(newQuantities);
                      setPendingChanges(false);
                    }}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmChanges}
                    className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Xác nhận
                  </button>
                </>
              ) : (
                <div className="text-center w-full text-gray-500">
                    Chọn món từ menu bên trái để cập nhật.
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmOrder}
        title="Xác nhận đặt món"
        message={`Bạn có chắc chắn muốn đặt các món sau?\n\n${getNewItemsSummary()}\n\nTổng tiền: ${pendingTotal.toLocaleString()}đ`}
        confirmText="Đặt món"
        cancelText="Hủy"
        type="info"
      />
    </>
  );
};

export default OrderItemsPanel; 