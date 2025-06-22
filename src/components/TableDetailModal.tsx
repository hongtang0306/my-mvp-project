import { useState, useEffect } from 'react';
import type { Table, Order, MenuItem, Reservation, MenuItemStatus } from '../types';
import orderData from '../data/orders.json';
import menuData from '../data/menu.json';
import reservationData from '../data/reservations.json';

interface TableDetailModalProps {
  table: Table;
  isOpen: boolean;
  onClose: () => void;
}

const TableDetailModal = ({ table, isOpen, onClose }: TableDetailModalProps) => {
  const [isAddingItems, setIsAddingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<{id: string; name: string; quantity: number; price: number}[]>([]);
  const [tempOrder, setTempOrder] = useState<{id: string; name: string; quantity: number; price: number}[]>([]);

  // Lấy đơn hàng hiện tại của bàn (nếu có)
  const currentOrder = (orderData.orders as Order[]).find(
    order => order.tableId === table.id && order.status !== 'completed'
  );

  // Lấy thông tin đặt bàn (nếu có)
  const reservation = (reservationData.reservations as Reservation[]).find(
    res => res.tableId === table.id && res.status === 'confirmed'
  );

  // Khởi tạo danh sách món ăn
  useEffect(() => {
    const items: MenuItem[] = menuData.categories.flatMap(category => 
      category.items.map(item => ({
        ...item,
        category: category.name,
        status: (item.status || 'available') as MenuItemStatus
      }))
    );
    setMenuItems(items);
  }, []);

  // Khởi tạo orderItems từ currentOrder nếu có
  useEffect(() => {
    if (currentOrder) {
      setOrderItems(currentOrder.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })));
    }
  }, [currentOrder]);

  // Lọc món ăn theo tìm kiếm và danh mục
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Thêm món vào tempOrder
  const addToOrder = (item: MenuItem) => {
    setTempOrder(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, quantity: 1, price: item.price }];
    });
  };

  // Cập nhật số lượng món trong tempOrder
  const updateTempQuantity = (itemId: string, delta: number) => {
    setTempOrder(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as typeof tempOrder
    );
  };

  // Xác nhận thêm món mới vào orderItems
  const confirmNewItems = () => {
    setOrderItems(prev => {
      const newItems = [...prev];
      tempOrder.forEach(tempItem => {
        const existingIndex = newItems.findIndex(item => item.id === tempItem.id);
        if (existingIndex >= 0) {
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + tempItem.quantity
          };
        } else {
          newItems.push(tempItem);
        }
      });
      return newItems;
    });
    setTempOrder([]);
    setIsAddingItems(false);
  };

  // Tính tổng tiền cho orderItems
  const totalOrderPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Tính tổng tiền cho tempOrder
  const totalTempPrice = tempOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Bàn {table.name}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
              table.status === 'available' ? 'bg-green-100 text-green-800' :
              table.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {table.status === 'available' ? 'Trống' :
               table.status === 'occupied' ? 'Đang phục vụ' :
               'Đã đặt'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Khu vực 1: Thông tin khách hàng */}
          {(table.status === 'occupied' || table.status === 'reserved') && reservation && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin khách hàng</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Tên khách hàng</p>
                  <p className="font-semibold">{reservation.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Số điện thoại</p>
                  <p className="font-semibold">{reservation.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Số lượng khách</p>
                  <p className="font-semibold">{reservation.numberOfGuests} người</p>
                </div>
                <div>
                  <p className="text-gray-600">Thời gian đặt</p>
                  <p className="font-semibold">
                    {new Date(reservation.reservationTime).toLocaleString()}
                  </p>
                </div>
                {reservation.specialNotes && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Ghi chú</p>
                    <p className="font-semibold">{reservation.specialNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Khu vực 2: Layout mới với 2 cột */}
          {table.status === 'occupied' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cột trái: Danh sách món đã gọi */}
              <div className="space-y-6">
                <div className="bg-white border rounded-lg shadow-sm">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Món đã gọi</h3>
                  </div>
                  <div className="p-4">
                    {orderItems.length > 0 ? (
                      <>
                        <div className="space-y-4 max-h-[calc(100vh-500px)] overflow-y-auto">
                          {orderItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{item.name}</h4>
                                <p className="text-sm text-gray-500">{item.price.toLocaleString()}đ/món</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="font-medium">{item.quantity} món</p>
                                  <p className="text-sm text-gray-500">
                                    {(item.price * item.quantity).toLocaleString()}đ
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Tổng tạm tính:</span>
                            <span className="text-lg font-semibold text-blue-600">
                              {totalOrderPrice.toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Chưa có món nào được gọi
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cột phải: Thêm món mới */}
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Thêm món mới</h3>
                  </div>
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Tìm kiếm món ăn..."
                      className="w-full p-2 border rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto py-4">
                    <button
                      className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                        selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      Tất cả
                    </button>
                    {menuData.categories.map(category => (
                      <button
                        key={category.id}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                          selectedCategory === category.name ? 'bg-blue-500 text-white' : 'bg-gray-100'
                        }`}
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  {/* Danh sách món có thể thêm */}
                  <div className="grid grid-cols-1 gap-2 max-h-[calc(100vh-600px)] overflow-y-auto">
                    {filteredItems.map(item => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-3 flex justify-between items-center hover:bg-gray-50"
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

                  {/* Danh sách món đang chọn */}
                  {tempOrder.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="font-semibold mb-4">Món đang chọn ({tempOrder.length})</h4>
                      <div className="space-y-4 max-h-[200px] overflow-y-auto">
                        {tempOrder.map(item => (
                          <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-gray-600">{item.price.toLocaleString()}đ</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateTempQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateTempQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center font-bold mb-4">
                          <span>Tổng cộng:</span>
                          <span>{totalTempPrice.toLocaleString()}đ</span>
                        </div>
                        <button
                          onClick={confirmNewItems}
                          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                        >
                          Xác nhận thêm món
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="border-t p-6 flex justify-end gap-4">
          {table.status === 'occupied' && (
            <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Thanh toán
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableDetailModal; 