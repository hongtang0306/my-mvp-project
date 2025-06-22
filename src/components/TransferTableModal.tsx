import React, { useState, useEffect } from 'react';
import type { Table, Floor, TableStatus } from '../types/table';
import TableTransferService from '../services/tableTransferService';
import ConfirmationModal from './ConfirmationModal';

interface TransferTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTable: Table;
  allTables: Table[];
  floors: Floor[];
  onTransferComplete: () => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

const TransferTableModal: React.FC<TransferTableModalProps> = ({
  isOpen,
  onClose,
  sourceTable,
  allTables,
  floors,
  onTransferComplete,
  showToast,
}) => {
  const [selectedTargetTable, setSelectedTargetTable] = useState<Table | null>(null);
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string>('');

  const transferService = TableTransferService.getInstance();

  // Get available tables for transfer (only 'Trống sạch')
  const availableTables = allTables.filter(t => t.status === 'Trống sạch' && t.id !== sourceTable.id);

  // Get floor name
  const getFloorName = (table: Table): string => {
    const floor = floors.find(f => f.id === table.floorId);
    return floor ? floor.name : table.zone;
  };

  // Get status color - simplified as we only deal with 'Đang phục vụ' and 'Trống sạch'
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Đang phục vụ':
        return 'bg-blue-100 border-blue-300';
      case 'Trống sạch':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!selectedTargetTable) {
      setError('Vui lòng chọn bàn đích');
      return false;
    }

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do chuyển bàn');
      return false;
    }

    // Validate transfer
    const validation = transferService.validateTransfer(sourceTable, selectedTargetTable);
    if (!validation.isValid) {
      setError(validation.error || 'Không thể chuyển bàn');
      return false;
    }

    setError('');
    return true;
  };

  // Handle transfer
  const handleTransfer = () => {
    if (!validateForm()) return;
    setShowConfirm(true);
  };

  // Confirm transfer
  const handleConfirmTransfer = () => {
    if (!selectedTargetTable) return;

    try {
      // Create transfer record
      const transfer = transferService.createTransfer({
        sourceTableId: sourceTable.id,
        targetTableId: selectedTargetTable.id,
        reason: reason.trim(),
        transferredBy: 'Hệ thống', // In real app, this would be current user
      }, sourceTable, selectedTargetTable);

      // Update target table with source table data
      const updatedTables = allTables.map(table => {
        if (table.id === selectedTargetTable.id) {
          // Transfer all data from source to target
          return {
            ...table,
            status: sourceTable.status,
            booking: sourceTable.booking,
            orderItems: sourceTable.orderItems,
          };
        }
        if (table.id === sourceTable.id) {
          // Set source table to "Bàn dơ" after transfer
          return {
            ...table,
            status: 'Bàn dơ' as TableStatus,
            booking: undefined,
            orderItems: undefined,
          };
        }
        return table;
      });

      // Save updated tables to localStorage
      localStorage.setItem('restaurant-tables', JSON.stringify(updatedTables));

      showToast('success', `Chuyển bàn thành công từ ${sourceTable.code} sang ${selectedTargetTable.code}`);
      
      // Reset form
      setSelectedTargetTable(null);
      setReason('');
      setError('');
      setShowConfirm(false);
      
      // Close modal and notify parent with updated tables
      onTransferComplete();
      onClose();
    } catch (error) {
      showToast('error', 'Có lỗi xảy ra khi chuyển bàn');
      setShowConfirm(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTargetTable(null);
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        {/* Adjusted width for a better vertical layout */}
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Chuyển bàn</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main content with vertical scroll */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Source Table Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-700">1. Thông tin bàn cần chuyển</h3>
              <div className={`p-4 rounded-lg border-2 ${getStatusColor(sourceTable.status)} grid grid-cols-1 md:grid-cols-3 gap-4`}>
                <div className="md:col-span-1">
                  <h4 className="font-bold text-xl">{sourceTable.code}</h4>
                  <p className="text-sm text-gray-600">{sourceTable.seats} chỗ</p>
                  <p className="text-sm font-medium">{sourceTable.status}</p>
                  <p className="text-sm text-gray-500">{getFloorName(sourceTable)}</p>
                </div>
                
                {sourceTable.booking && (
                  <div className="md:col-span-1 p-3 bg-white/60 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800">Thông tin đặt bàn:</p>
                    <p className="text-sm">Khách: {sourceTable.booking.customerName}</p>
                    <p className="text-sm">SĐT: {sourceTable.booking.phoneNumber}</p>
                    <p className="text-sm">Số người: {sourceTable.booking.numberOfGuests}</p>
                  </div>
                )}
                
                {sourceTable.orderItems && sourceTable.orderItems.length > 0 && (
                  <div className="md:col-span-1 p-3 bg-white/60 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800">Món đã đặt ({sourceTable.orderItems.length}):</p>
                    <div className="text-sm space-y-1 max-h-24 overflow-y-auto">
                      {sourceTable.orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{item.price.toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Target Table Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-700">2. Chọn bàn trống để chuyển đến</h3>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {availableTables.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Không có bàn trống nào phù hợp để chuyển.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {availableTables.map((table) => (
                      <div
                        key={table.id}
                        onClick={() => setSelectedTargetTable(table)}
                        className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all duration-200 ${
                          selectedTargetTable?.id === table.id
                            ? 'border-blue-500 bg-blue-100 scale-105 shadow-lg'
                            : 'border-green-300 bg-green-50 hover:border-green-500 hover:bg-green-100'
                        }`}
                      >
                        <h4 className="font-semibold text-lg">{table.code}</h4>
                        <p className="text-sm text-gray-600">{table.seats} chỗ</p>
                        <p className="text-xs text-gray-500">{getFloorName(table)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-3">
              <label htmlFor="transfer-reason" className="block font-semibold text-lg text-gray-700">
                3. Lý do chuyển bàn <span className="text-red-500">*</span>
              </label>
              <textarea
                id="transfer-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ví dụ: Khách hàng yêu cầu, ghép bàn,..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleTransfer}
              disabled={!selectedTargetTable || !reason.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                <path d="M10 2a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 2zM5.22 5.22a.75.75 0 011.06 0l2.47 2.47a.75.75 0 01-1.06 1.06L5.22 6.28a.75.75 0 010-1.06zm9.56 0a.75.75 0 010 1.06l-2.47 2.47a.75.75 0 11-1.06-1.06l2.47-2.47a.75.75 0 011.06 0zM10 12a1 1 0 100 2h.01a1 1 0 100-2H10z" />
                <path fillRule="evenodd" d="M3.75 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75zm0-3.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75zm0 7a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-4.25-9.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75z" />
              </svg>
              Xác nhận chuyển bàn
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmTransfer}
        title="Xác nhận chuyển bàn"
        message={`Bạn có chắc muốn chuyển từ bàn ${sourceTable.code} sang bàn ${selectedTargetTable?.code}?`}
        confirmText="Chuyển"
        cancelText="Hủy"
        type="warning"
        zIndex="z-50"
      />
    </>
  );
};

export default TransferTableModal; 