import React, { useState, useEffect } from 'react';
import type { Table, TableStatus, OrderItem, Floor, TableCategory, BookingFormData } from '../types/table';
import OrderItemsPanel from './OrderItemsPanel';
import ConfirmationModal from './ConfirmationModal';
import TransferHistoryModal from './TransferHistoryModal';
import TableStatusControl from './TableStatusControl';
import TableConfigService from '../services/TableConfigService';

interface TableDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
  onStatusChange: (status: TableStatus, bookingData?: BookingFormData) => void;
  onPaymentClick: () => void;
  onUpdateOrder: (items: OrderItem[]) => void;
  onTransferClick: () => void;
}

// Reusable InfoCard component
const InfoCard = ({ title, icon, children, defaultOpen = false }: { title: string, icon: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <button
        className="w-full flex justify-between items-center p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-md font-semibold text-gray-700 flex items-center">
          {icon}
          {title}
        </h3>
        <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};


const TableDetailsModal: React.FC<TableDetailsModalProps> = ({
  isOpen,
  onClose,
  table,
  onStatusChange,
  onPaymentClick,
  onUpdateOrder,
  onTransferClick,
}) => {
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showTransferHistory, setShowTransferHistory] = useState(false);
  const [tableConfig, setTableConfig] = useState<any>(null);
  const [floor, setFloor] = useState<Floor | null>(null);
  const [category, setCategory] = useState<TableCategory | null>(null);

  useEffect(() => {
    if (isOpen && table) {
      const tableConfigService = TableConfigService.getInstance();
      const config = tableConfigService.getTableConfigByTableId(table.id);
      setTableConfig(config);

      if (config) {
        const floorData = tableConfigService.getFloorById(config.floorId);
        const categoryData = tableConfigService.getCategoryById(config.categoryId);
        setFloor(floorData || null);
        setCategory(categoryData || null);
      } else {
        setFloor(null);
        setCategory(null);
      }
    }
  }, [isOpen, table]);

  const handlePaymentConfirm = () => {
    // Business rule: Prevent payment if unpaid items exist
    if ((table.orderItems?.length || 0) > 0) {
      setShowPaymentConfirm(true);
    } else {
      alert("Không có sản phẩm nào để thanh toán.");
    }
  };
  
  const showToast = (type: 'success' | 'error', message: string) => {
    // You can use a proper toast library
    alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-30">
        <div className="bg-gray-50 rounded-xl w-full max-w-[95vw] h-[95vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Bàn {table.code}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {floor?.name || 'Chưa gán tầng'} • {category?.name || 'Chưa gán loại'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Details & Actions */}
            <div className="w-1/3 p-6 overflow-y-auto border-r bg-white space-y-6">
              {/* Status Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cập nhật trạng thái</label>
                <TableStatusControl 
                  table={table} 
                  onStatusChange={onStatusChange} 
                  showToast={showToast} 
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                 <h3 className="text-md font-semibold text-gray-700">Tác vụ</h3>
                <button
                  onClick={handlePaymentConfirm}
                  disabled={!table.orderItems || table.orderItems.length === 0}
                  className="w-full flex items-center justify-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg>
                  Thanh toán
                </button>
                <button
                  onClick={onTransferClick}
                  disabled={table.status !== 'Đang phục vụ'}
                  className="w-full flex items-center justify-center p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/></svg>
                  Chuyển bàn
                </button>
                <button
                  onClick={() => setShowTransferHistory(true)}
                  className="w-full flex items-center justify-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                  Lịch sử chuyển bàn
                </button>
              </div>

              {/* Booking Info Card */}
              {table.booking && (
                <InfoCard
                  title="Thông tin Đặt bàn"
                  defaultOpen={true}
                  icon={<svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                >
                  <div className="space-y-2 text-sm">
                    <p><strong>Khách hàng:</strong> {table.booking.customerName}</p>
                    <p><strong>SĐT:</strong> {table.booking.phoneNumber}</p>
                    <p><strong>Số khách:</strong> {table.booking.numberOfGuests}</p>
                    <p><strong>Thời gian:</strong> {new Date(table.booking.reservationTime).toLocaleString('vi-VN')}</p>
                    {table.booking.specialNotes && <p><strong>Ghi chú:</strong> {table.booking.specialNotes}</p>}
                  </div>
                </InfoCard>
              )}

              {/* Table Config Info Card */}
              <InfoCard
                title="Thông tin Cấu hình"
                icon={<svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              >
                <div className="space-y-2 text-sm">
                  <p><strong>Tầng:</strong> {floor?.name || 'N/A'}</p>
                  <p><strong>Loại bàn:</strong> {category?.name || 'N/A'}</p>
                  <p><strong>Sức chứa:</strong> {table.seats} người</p>
                </div>
              </InfoCard>

            </div>

            {/* Right Panel - Order Items */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 rounded-b-xl md:rounded-r-xl md:rounded-b-none">
              <OrderItemsPanel
                initialItems={table.orderItems || []}
                onUpdateOrder={onUpdateOrder}
                isServing={table.status === 'Đang phục vụ'}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showPaymentConfirm}
        onClose={() => setShowPaymentConfirm(false)}
        onConfirm={() => {
          onPaymentClick();
          setShowPaymentConfirm(false);
        }}
        title="Xác nhận thanh toán"
        message={`Thực hiện thanh toán cho bàn ${table.code}?`}
        confirmText="Thanh toán"
        type="warning"
      />

      <TransferHistoryModal
        isOpen={showTransferHistory}
        onClose={() => setShowTransferHistory(false)}
        tableId={table.id}
      />
    </>
  );
};

export default TableDetailsModal; 