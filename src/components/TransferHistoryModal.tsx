import React, { useState, useEffect } from 'react';
import type { TableTransfer, Table } from '../types/table';
import TableTransferService from '../services/tableTransferService';

interface TransferHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
}

const TransferHistoryModal: React.FC<TransferHistoryModalProps> = ({
  isOpen,
  onClose,
  tableId,
}) => {
  const [transfers, setTransfers] = useState<TableTransfer[]>([]);
  const [table, setTable] = useState<Table | null>(null);

  const transferService = TableTransferService.getInstance();

  useEffect(() => {
    if (isOpen && tableId) {
      // Find the table from localStorage
      const storedTables = localStorage.getItem('restaurant-tables');
      if (storedTables) {
        const tables: Table[] = JSON.parse(storedTables);
        const currentTable = tables.find(t => t.id === tableId);
        setTable(currentTable || null);
      }
      
      loadTableTransfers();
      
      // Subscribe to transfer changes
      const unsubscribe = transferService.subscribe(loadTableTransfers);
      return unsubscribe;
    }
  }, [isOpen, tableId]);

  const loadTableTransfers = () => {
    const tableTransfers = transferService.getTransfersByTable(tableId);
    setTransfers(tableTransfers);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Lịch sử chuyển bàn</h2>
              {table && (
                <p className="text-sm text-gray-600 mt-1">Bàn {table.code} - {table.zone}</p>
              )}
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

          {transfers.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">Chưa có lịch sử chuyển bàn cho bàn này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div key={transfer.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {transfer.sourceTableCode}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">
                          {transfer.targetTableCode}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {formatDate(transfer.transferredAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {transfer.transferredBy}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Lý do:</span>
                      <p className="text-sm text-gray-900 mt-1">{transfer.reason}</p>
                    </div>
                    
                    {transfer.customerName && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Khách hàng:</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {transfer.customerName}
                          {transfer.numberOfGuests && ` (${transfer.numberOfGuests} người)`}
                        </p>
                      </div>
                    )}
                    
                    {transfer.orderItems && transfer.orderItems.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Món đã đặt:</span>
                        <div className="text-sm text-gray-900 mt-1">
                          {transfer.orderItems.map((item, index) => (
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
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferHistoryModal; 