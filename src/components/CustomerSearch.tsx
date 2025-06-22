import React from 'react';
import type { CustomerSearchFilters } from '../types/customer';

interface CustomerSearchProps {
  filters: CustomerSearchFilters;
  onFiltersChange: (filters: CustomerSearchFilters) => void;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({
  filters,
  onFiltersChange
}) => {

  const handleInputChange = (field: keyof CustomerSearchFilters, value: any) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const handleAmountChange = (field: 'minAmount' | 'maxAmount', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    handleInputChange(field, numValue);
  };
  
  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      paymentMethod: 'all',
      minAmount: undefined,
      maxAmount: undefined
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-4">
        {/* Search Input */}
        <div className="lg:col-span-12">
          <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-1">
            Tìm kiếm khách hàng
          </label>
          <input
            id="search-term"
            type="text"
            placeholder="Tìm theo tên, số điện thoại, mã khách hàng..."
            value={filters.searchTerm}
            onChange={(e) => handleInputChange('searchTerm', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date Range Filter */}
        <div className="lg:col-span-4">
          <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
            Lần cuối đến
          </label>
          <div className="flex items-center gap-2">
            <input
              id="date-from"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Amount Range Filter */}
        <div className="lg:col-span-4">
          <label htmlFor="min-amount" className="block text-sm font-medium text-gray-700 mb-1">
            Khoảng chi tiêu (VND)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="min-amount"
              type="number"
              placeholder="Từ"
              value={filters.minAmount || ''}
              onChange={(e) => handleAmountChange('minAmount', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Đến"
              value={filters.maxAmount || ''}
              onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Payment Method & Clear Button */}
        <div className="lg:col-span-4 flex items-end gap-2">
          <div className="flex-grow">
            <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-1">
              Phương thức thanh toán
            </label>
            <select
              id="payment-method"
              value={filters.paymentMethod || 'all'}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
              <option value="qr">QR Code</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 h-[42px] mt-auto"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSearch; 