import React, { useState, useEffect } from 'react';
import type { Customer, CustomerOrder, CustomerSearchFilters } from '../types/customer';
import CustomerService from '../services/customerService';
import CustomerSearch from '../components/CustomerSearch';
import CustomerList from '../components/CustomerList';
import CustomerOrderHistory from '../components/CustomerOrderHistory';
import CustomerStatistics from '../components/CustomerStatistics';
import CustomerInfoCard from '../components/CustomerInfoCard';

const CustomerHistoryPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [filters, setFilters] = useState<CustomerSearchFilters>({
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    paymentMethod: 'all',
    minAmount: undefined,
    maxAmount: undefined
  });
  const [activeTab, setActiveTab] = useState<'customers' | 'statistics'>('customers');

  const customerService = CustomerService.getInstance();

  useEffect(() => {
    const unsubscribe = customerService.subscribe(loadCustomers);
    loadCustomers();
    return unsubscribe;
  }, [filters]);

  const loadCustomers = () => {
    const filteredCustomers = customerService.searchCustomers(filters);
    setCustomers(filteredCustomers);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    const orders = customerService.getCustomerOrders(customer.id);
    setCustomerOrders(orders);
  };

  const handleFiltersChange = (newFilters: CustomerSearchFilters) => {
    setFilters(newFilters);
  };

  const handleBackToCustomers = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  const handleCreateSampleData = () => {
    customerService.createSampleData();
    loadCustomers();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Lịch sử khách hàng</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'customers'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Danh sách khách hàng
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'statistics'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Thống kê
          </button>
        </div>
      </div>

      {activeTab === 'customers' ? (
        <div className="space-y-6">
          {selectedCustomer ? (
            <>
              <CustomerInfoCard 
                customer={selectedCustomer} 
                onBack={handleBackToCustomers} 
              />
              <CustomerOrderHistory
                customer={selectedCustomer}
                orders={customerOrders}
              />
            </>
          ) : (
            <>
              <CustomerSearch
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
              {customers.length === 0 && !filters.searchTerm && (
                 <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                   <div className="text-gray-500 mb-4">
                     <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                     </svg>
                   </div>
                   <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dữ liệu khách hàng</h3>
                   <p className="text-gray-500 mb-4">Tạo dữ liệu mẫu để test tính năng hoặc thực hiện thanh toán để tạo dữ liệu thực.</p>
                   <button
                     onClick={handleCreateSampleData}
                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                   >
                     Tạo dữ liệu mẫu
                   </button>
                 </div>
              )}
              <CustomerList
                customers={customers}
                onCustomerSelect={handleCustomerSelect}
              />
            </>
          )}
        </div>
      ) : (
        <CustomerStatistics />
      )}
    </div>
  );
};

export default CustomerHistoryPage; 