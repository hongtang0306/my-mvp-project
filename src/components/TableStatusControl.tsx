import React, { useState } from 'react';
import type { Table, TableStatus, BookingFormData } from '../types/table';

interface TableStatusControlProps {
  table: Table;
  onStatusChange: (status: TableStatus, bookingData?: BookingFormData) => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

const TableStatusControl: React.FC<TableStatusControlProps> = ({
  table,
  onStatusChange,
  showToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TableStatus | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    customerName: '',
    phoneNumber: '',
    reservationTime: '',
    numberOfGuests: table.seats,
    specialNotes: ''
  });

  const statusOptions: { value: TableStatus; label: string; color: string; icon: string }[] = [
    { value: 'Trống sạch', label: 'Trống sạch', color: 'bg-white border-gray-300', icon: '🟢' },
    { value: 'Đã Đặt', label: 'Đã đặt', color: 'bg-yellow-100 border-yellow-300', icon: '📅' },
    { value: 'Đang phục vụ', label: 'Đang phục vụ', color: 'bg-blue-100 border-blue-300', icon: '🍽️' },
    { value: 'Bàn dơ', label: 'Bàn dơ', color: 'bg-red-100 border-red-300', icon: '🧹' },
    { value: 'Bảo trì', label: 'Bảo trì', color: 'bg-orange-100 border-orange-300', icon: '🔧' },
    { value: 'Tạm ngưng', label: 'Tạm ngưng', color: 'bg-gray-100 border-gray-300', icon: '⏸️' }
  ];

  const handleStatusSelect = (status: TableStatus) => {
    if (status === 'Đã Đặt') {
      setSelectedStatus(status);
      setShowBookingForm(true);
    } else {
      handleStatusChange(status);
    }
  };

  const handleStatusChange = (status: TableStatus, bookingData?: BookingFormData) => {
    // Validation for changing from "Serving" to "Dirty"
    if (table.status === 'Đang phục vụ' && status === 'Bàn dơ') {
      if (table.orderItems && table.orderItems.length > 0) {
        const unpaidItems = table.orderItems.filter(item => item.price > 0);
        if (unpaidItems.length > 0) {
          showToast('error', 'Không thể chuyển bàn từ "Đang phục vụ" sang "Bàn dơ" khi còn món chưa thanh toán!');
          return;
        }
      }
    }

    onStatusChange(status, bookingData);
    setIsOpen(false);
    setSelectedStatus(null);
    setShowBookingForm(false);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === 'Đã Đặt') {
      handleStatusChange(selectedStatus, bookingData);
    }
  };

  const getCurrentStatusInfo = () => {
    return statusOptions.find(option => option.value === table.status);
  };

  const currentStatus = getCurrentStatusInfo();

  return (
    <div className="relative">
      {/* Status Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trạng thái hiện tại
        </label>
        <div className={`inline-flex items-center px-3 py-2 rounded-lg border-2 ${currentStatus?.color}`}>
          <span className="mr-2">{currentStatus?.icon}</span>
          <span className="font-medium">{currentStatus?.label}</span>
        </div>
      </div>

      {/* Status Change Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thay đổi trạng thái
        </label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Chọn trạng thái mới</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="py-1">
                {statusOptions
                  .filter(option => option.value !== table.status)
                  .map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusSelect(option.value)}
                      className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      <span className="mr-2">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Thông tin đặt bàn</h3>
            <form onSubmit={handleBookingSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={bookingData.phoneNumber}
                    onChange={(e) => setBookingData({ ...bookingData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian đặt bàn *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingData.reservationTime}
                    onChange={(e) => setBookingData({ ...bookingData, reservationTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số khách *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={table.seats}
                    value={bookingData.numberOfGuests}
                    onChange={(e) => setBookingData({ ...bookingData, numberOfGuests: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={bookingData.specialNotes}
                    onChange={(e) => setBookingData({ ...bookingData, specialNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedStatus(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableStatusControl; 