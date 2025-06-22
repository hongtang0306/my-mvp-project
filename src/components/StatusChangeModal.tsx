import React, { useState } from 'react';
import type { Table, TableStatus, BookingFormData } from '../types/table';
import ConfirmationModal from './ConfirmationModal';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
  onStatusChange: (status: TableStatus, bookingData?: BookingFormData) => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps & { showToast?: (type: 'success' | 'error', message: string) => void }> = ({
  isOpen,
  onClose,
  table,
  onStatusChange,
  showToast,
}) => {
  const [bookingData, setBookingData] = useState<BookingFormData>({
    customerName: '',
    phoneNumber: '',
    reservationTime: '',
    numberOfGuests: 1,
    specialNotes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [pendingStatus, setPendingStatus] = useState<TableStatus | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const getAvailableStatuses = (currentStatus: TableStatus): TableStatus[] => {
    switch (currentStatus) {
      case 'Trống sạch':
        return ['Đã Đặt', 'Bảo trì', 'Tạm ngưng'];
      case 'Đã Đặt':
        return ['Đang phục vụ', 'Trống sạch', 'Bảo trì', 'Tạm ngưng'];
      case 'Đang phục vụ':
        // Chỉ cho phép chuyển sang bàn dơ khi đã thanh toán
        return ['Bảo trì', 'Tạm ngưng'];
      case 'Bàn dơ':
        return ['Trống sạch', 'Bảo trì', 'Tạm ngưng'];
      case 'Bảo trì':
        return ['Trống sạch', 'Tạm ngưng'];
      case 'Tạm ngưng':
        return ['Trống sạch', 'Bảo trì'];
      default:
        return [];
    }
  };

  const validateBookingData = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!bookingData.customerName.trim()) {
      newErrors.customerName = 'Vui lòng nhập tên khách hàng';
    }

    if (!bookingData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(bookingData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (!bookingData.reservationTime) {
      newErrors.reservationTime = 'Vui lòng chọn thời gian';
    }

    if (bookingData.numberOfGuests < 1) {
      newErrors.numberOfGuests = 'Số khách phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStatusChange = (newStatus: TableStatus) => {
    // Kiểm tra logic đặc biệt cho bàn đang phục vụ
    if (table.status === 'Đang phục vụ' && newStatus === 'Bàn dơ') {
      // Kiểm tra xem bàn có món ăn chưa thanh toán không
      if (table.orderItems && table.orderItems.length > 0) {
        const totalAmount = table.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (showToast) {
          showToast('error', `Không thể chuyển bàn ${table.code} sang "Bàn dơ"! Bàn này còn ${table.orderItems.length} món chưa thanh toán (tổng: ${totalAmount.toLocaleString()}đ). Vui lòng thanh toán trước khi dọn bàn.`);
        }
        return;
      }
    }
    
    setPendingStatus(newStatus);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (pendingStatus === 'Đã Đặt') {
      if (!validateBookingData()) {
        if (showToast) showToast('error', 'Vui lòng nhập đầy đủ thông tin đặt bàn!');
        setShowConfirm(false);
        return;
      }
      onStatusChange(pendingStatus, bookingData);
      if (showToast) showToast('success', 'Cập nhật trạng thái thành công!');
    } else if (pendingStatus) {
      onStatusChange(pendingStatus);
      if (showToast) showToast('success', 'Cập nhật trạng thái thành công!');
    }
    setShowConfirm(false);
    setPendingStatus(null);
    onClose();
  };

  const getStatusColor = (status: TableStatus): string => {
    switch (status) {
      case 'Trống sạch':
        return 'bg-white border-2 border-gray-300 text-gray-700';
      case 'Đã Đặt':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đang phục vụ':
        return 'bg-blue-100 text-blue-800';
      case 'Bàn dơ':
        return 'bg-red-100 text-red-800';
      case 'Bảo trì':
        return 'bg-orange-100 text-orange-800';
      case 'Tạm ngưng':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  const availableStatuses = getAvailableStatuses(table.status);

  return (
    <>
      {/* Modal đổi trạng thái */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Thay đổi trạng thái bàn</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Bàn {table.code} - Trạng thái hiện tại: {table.status}
                  </p>
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

              {availableStatuses.length === 0 ? (
                <div className="text-center py-4">
                  {table.status === 'Đang phục vụ' ? (
                    <p className="text-gray-600">
                      Bàn đang phục vụ chỉ có thể chuyển sang trạng thái "Bàn dơ" sau khi thanh toán
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      Không có trạng thái mới khả dụng cho bàn này
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Booking Form for "Đã Đặt" status */}
                  {table.status === 'Trống sạch' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên khách hàng
                        </label>
                        <input
                          type="text"
                          value={bookingData.customerName}
                          onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          placeholder="Nhập tên khách hàng"
                        />
                        {errors.customerName && (
                          <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={bookingData.phoneNumber}
                          onChange={(e) => setBookingData({ ...bookingData, phoneNumber: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          placeholder="Nhập số điện thoại"
                        />
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thời gian đặt bàn
                        </label>
                        <input
                          type="datetime-local"
                          value={bookingData.reservationTime}
                          onChange={(e) => setBookingData({ ...bookingData, reservationTime: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        />
                        {errors.reservationTime && (
                          <p className="text-red-500 text-sm mt-1">{errors.reservationTime}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số khách
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={bookingData.numberOfGuests}
                          onChange={(e) => setBookingData({ ...bookingData, numberOfGuests: parseInt(e.target.value) || 1 })}
                          className="w-full p-2 border rounded-md"
                        />
                        {errors.numberOfGuests && (
                          <p className="text-red-500 text-sm mt-1">{errors.numberOfGuests}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ghi chú đặc biệt
                        </label>
                        <textarea
                          value={bookingData.specialNotes}
                          onChange={(e) => setBookingData({ ...bookingData, specialNotes: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          rows={3}
                          placeholder="Nhập ghi chú đặc biệt (nếu có)"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Change Buttons */}
                  <div className="flex flex-col gap-2 mt-4">
                    <h3 className="font-medium text-gray-700">Chọn trạng thái mới:</h3>
                    {availableStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`p-3 rounded-lg ${getStatusColor(status)} hover:opacity-90 transition-opacity`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setPendingStatus(null);
        }}
        onConfirm={handleConfirm}
        title="Xác nhận thay đổi trạng thái"
        message={`Bạn có chắc chắn muốn chuyển trạng thái bàn ${table.code} từ "${table.status}" sang "${pendingStatus}" không?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        type="warning"
      />
    </>
  );
};

export default StatusChangeModal; 