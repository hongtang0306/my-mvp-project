import React from 'react';
import type { Customer } from '../types/customer';

interface CustomerInfoCardProps {
  customer: Customer;
  onBack: () => void;
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ customer, onBack }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{customer.name}</h3>
          <p className="text-sm text-gray-500">{customer.customerCode}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{customer.phone}</p>
          <p className="text-sm text-gray-500">Số điện thoại</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{customer.visitCount}</p>
          <p className="text-sm text-gray-500">Số lần đến</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
          <p className="text-sm text-gray-500">Tổng chi tiêu</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoCard; 