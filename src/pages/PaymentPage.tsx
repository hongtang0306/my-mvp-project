import { useState } from 'react';
import type { Order, OrderStatus } from '../types';
import orderData from '../data/orders.json';

type PaymentMethod = 'cash' | 'card' | 'qr';

interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

const PaymentPage = () => {
  const [orders] = useState<Order[]>(
    orderData.orders.filter(order => 
      (order.status as OrderStatus) === 'served'
    ).map(order => ({
      ...order,
      status: order.status as OrderStatus
    }))
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [splitAmount, setSplitAmount] = useState<number[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);
  const [payments, setPayments] = useState<PaymentDetails[]>([]);

  // Xử lý thanh toán
  const handlePayment = () => {
    if (!selectedOrder) return;

    const payment: PaymentDetails = {
      method: paymentMethod,
      amount: selectedOrder.totalAmount,
      reference: `PAY-${Date.now()}`
    };

    setPayments(prev => [...prev, payment]);
    setSelectedOrder(null);
    setPaymentMethod('cash');
  };

  // Xử lý chia bill
  const handleSplitBill = () => {
    if (!selectedOrder) return;
    
    const numberOfSplits = 2; // Mặc định chia đôi
    const amountPerPerson = Math.floor(selectedOrder.totalAmount / numberOfSplits);
    const remainder = selectedOrder.totalAmount % numberOfSplits;
    
    const splits = Array(numberOfSplits).fill(amountPerPerson);
    splits[0] += remainder; // Cộng phần dư vào người đầu tiên
    
    setSplitAmount(splits);
    setIsSplitting(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Danh sách đơn cần thanh toán */}
        <div className="lg:w-1/3">
          <h2 className="text-2xl font-bold mb-4">Đơn cần thanh toán</h2>
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors
                  ${selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
                onClick={() => {
                  setSelectedOrder(order);
                  setIsSplitting(false);
                  setSplitAmount([]);
                }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Bàn {order.tableId}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {order.items.length} món - {order.totalAmount.toLocaleString()}đ
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chi tiết thanh toán */}
        <div className="lg:w-2/3">
          {selectedOrder ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Thanh toán - Bàn {selectedOrder.tableId}</h2>
                <button
                  onClick={handleSplitBill}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  Chia bill
                </button>
              </div>

              {/* Danh sách món */}
              <div className="space-y-4 mb-6">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>

              {/* Phương thức thanh toán */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">Phương thức thanh toán</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`px-4 py-2 rounded-lg border ${
                      paymentMethod === 'cash' ? 'bg-blue-500 text-white' : 'border-gray-300'
                    }`}
                  >
                    Tiền mặt
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`px-4 py-2 rounded-lg border ${
                      paymentMethod === 'card' ? 'bg-blue-500 text-white' : 'border-gray-300'
                    }`}
                  >
                    Thẻ
                  </button>
                  <button
                    onClick={() => setPaymentMethod('qr')}
                    className={`px-4 py-2 rounded-lg border ${
                      paymentMethod === 'qr' ? 'bg-blue-500 text-white' : 'border-gray-300'
                    }`}
                  >
                    QR Code
                  </button>
                </div>
              </div>

              {/* Chia bill */}
              {isSplitting && (
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Chia bill</h3>
                  <div className="space-y-2">
                    {splitAmount.map((amount, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Người {index + 1}</span>
                        <span>{amount.toLocaleString()}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tổng cộng và nút thanh toán */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold mb-4">
                  <span>Tổng cộng</span>
                  <span>{selectedOrder.totalAmount.toLocaleString()}đ</span>
                </div>
                <button
                  onClick={handlePayment}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Chọn một đơn hàng để thanh toán
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 