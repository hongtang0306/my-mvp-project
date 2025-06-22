import React, { useState } from 'react';
import type { Customer, CustomerOrder } from '../types/customer';
import CustomerService from '../services/customerService';
import OrderDetailModal from './OrderDetailModal';

interface CustomerOrderHistoryProps {
  customer: Customer;
  orders: CustomerOrder[];
}

const CustomerOrderHistory: React.FC<CustomerOrderHistoryProps> = ({
  customer,
  orders
}) => {
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  const customerService = CustomerService.getInstance();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Tiền mặt';
      case 'card': return 'Thẻ';
      case 'qr': return 'QR Code';
      default: return method;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'qr': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = dateFilter.from || dateFilter.to 
    ? customerService.getCustomerOrdersByDateRange(customer.id, dateFilter.from, dateFilter.to)
    : orders;

  const totalSpent = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = filteredOrders.length > 0 ? totalSpent / filteredOrders.length : 0;

  const handleOrderClick = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Lọc theo thời gian:</span>
          <input
            type="date"
            value={dateFilter.from}
            onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <span className="text-gray-500">đến</span>
          <input
            type="date"
            value={dateFilter.to}
            onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={() => setDateFilter({ from: '', to: '' })}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{filteredOrders.length}</div>
          <div className="text-sm text-gray-500">Đơn hàng</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSpent)}</div>
          <div className="text-sm text-gray-500">Tổng chi tiêu</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(averageOrderValue)}</div>
          <div className="text-sm text-gray-500">Trung bình/đơn</div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Lịch sử đơn hàng ({filteredOrders.length})
          </h3>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Không có đơn hàng nào trong khoảng thời gian đã chọn.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleOrderClick(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          Đơn hàng #{order.id.slice(-8)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Bàn {order.tableCode} • {formatDateTime(order.orderDate)}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(order.paymentMethod)}`}>
                        {getPaymentMethodText(order.paymentMethod)}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {order.orderItems.length} món • {formatCurrency(order.totalAmount)}
                      </p>
                      {order.notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          Ghi chú: {order.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={showOrderDetail}
          onClose={() => setShowOrderDetail(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default CustomerOrderHistory; 