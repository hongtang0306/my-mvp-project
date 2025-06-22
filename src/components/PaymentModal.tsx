import React, { useState } from 'react';
import type { Table, PaymentDetails } from '../types/table';
import ReportService from '../services/reportService';
import CustomerService from '../services/customerService';
import ConfirmationModal from './ConfirmationModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
  onPaymentComplete: (paymentDetails: PaymentDetails) => void;
}

const PaymentModal: React.FC<PaymentModalProps & { showToast?: (type: 'success' | 'error', message: string) => void }> = ({
  isOpen,
  onClose,
  table,
  onPaymentComplete,
  showToast,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen || !table.orderItems) return null;

  const subtotal = table.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.1); // 10% VAT
  const total = subtotal + tax;

  const handlePaymentConfirm = () => {
    setShowConfirm(true);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Giả lập xử lý thanh toán
      await new Promise(resolve => setTimeout(resolve, 1500));

      const paymentDetails: PaymentDetails = {
        subtotal,
        tax,
        total,
        paymentMethod,
        paymentStatus: 'completed',
        timestamp: new Date().toISOString(),
      };

      // Lưu vào ReportService
      const reportService = ReportService.getInstance();
      reportService.addPayment(table, paymentDetails);

      // Tích hợp với CustomerService
      const customerService = CustomerService.getInstance();
      
      // Tạo hoặc lấy customer từ booking info
      let customerId: string;
      if (table.booking?.customerName && table.booking?.phoneNumber) {
        const customer = customerService.createCustomer(
          table.booking.customerName,
          table.booking.phoneNumber
        );
        customerId = customer.id;
      } else {
        // Tạo customer ẩn danh nếu không có thông tin booking
        const anonymousCustomer = customerService.createCustomer(
          'Khách lẻ',
          `anonymous-${Date.now()}`
        );
        customerId = anonymousCustomer.id;
      }

      // Tạo order trong CustomerService
      customerService.createOrder(
        customerId,
        table.id,
        table.code,
        table.orderItems || [],
        total,
        paymentMethod,
        table.booking?.specialNotes
      );

      onPaymentComplete(paymentDetails);
      if (showToast) showToast('success', 'Thanh toán thành công!');
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      if (showToast) showToast('error', 'Thanh toán thất bại!');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Thanh toán</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                disabled={isProcessing}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order Summary */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Chi tiết đơn hàng - Bàn {table.code}</h3>
              <div className="space-y-2">
                {table.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} x{item.quantity}
                      {item.notes && (
                        <span className="text-gray-500 ml-2">({item.notes})</span>
                      )}
                    </span>
                    <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (10%):</span>
                <span>{tax.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span>{total.toLocaleString()}đ</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Phương thức thanh toán</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-lg border ${
                    paymentMethod === 'cash'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  Tiền mặt
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-lg border ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  Thẻ
                </button>
                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`p-3 rounded-lg border ${
                    paymentMethod === 'qr'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  QR Code
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={isProcessing}
              >
                Hủy
              </button>
              <button
                onClick={handlePaymentConfirm}
                disabled={isProcessing}
                className={`p-2 bg-blue-500 text-white rounded-lg ${
                  isProcessing ? 'opacity-50' : 'hover:bg-blue-600'
                }`}
              >
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handlePayment}
        title="Xác nhận thanh toán"
        message={`Bạn có chắc chắn muốn thanh toán cho bàn ${table.code} với số tiền ${total.toLocaleString()}đ bằng ${
          paymentMethod === 'cash' ? 'tiền mặt' : 
          paymentMethod === 'card' ? 'thẻ' : 'QR Code'
        } không?`}
        confirmText="Thanh toán"
        cancelText="Hủy"
        type="warning"
        zIndex="z-50"
      />
    </>
  );
};

export default PaymentModal; 