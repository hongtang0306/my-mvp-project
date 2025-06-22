import React, { useState, useEffect } from 'react';
import type { TableTransfer, Floor } from '../types/table';
import TableTransferService from '../services/tableTransferService';
import ConfirmationModal from './ConfirmationModal';

interface TransferHistoryProps {
  floors: Floor[];
}

const TransferHistory: React.FC<TransferHistoryProps> = ({ floors }) => {
  const [transfers, setTransfers] = useState<TableTransfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<TableTransfer[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TableTransfer | null>(null);

  const transferService = TableTransferService.getInstance();

  useEffect(() => {
    loadTransfers();
    
    // Subscribe to transfer changes
    const unsubscribe = transferService.subscribe(() => {
      loadTransfers();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    filterTransfers();
  }, [transfers, dateFilter, floorFilter, searchTerm]);

  const loadTransfers = () => {
    setTransfers(transferService.getAllTransfers());
  };

  const filterTransfers = () => {
    let filtered = [...transfers];

    // Filter by date
    if (dateFilter !== 'all') {
      const today = new Date();
      const startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(transfer => {
        const transferDate = new Date(transfer.transferredAt);
        return transferDate >= startDate && transferDate <= today;
      });
    }

    // Filter by floor
    if (floorFilter !== 'all') {
      filtered = filtered.filter(transfer => 
        transfer.sourceFloorId === floorFilter || transfer.targetFloorId === floorFilter
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transfer =>
        transfer.sourceTableCode.toLowerCase().includes(term) ||
        transfer.targetTableCode.toLowerCase().includes(term) ||
        transfer.customerName?.toLowerCase().includes(term) ||
        transfer.reason.toLowerCase().includes(term) ||
        transfer.transferredBy.toLowerCase().includes(term)
      );
    }

    setFilteredTransfers(filtered);
  };

  const handleDeleteTransfer = (transfer: TableTransfer) => {
    setSelectedTransfer(transfer);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTransfer = () => {
    if (!selectedTransfer) return;
    
    const success = transferService.deleteTransfer(selectedTransfer.id);
    if (success) {
      // Transfer will be updated via subscription
    }
    
    setIsDeleteModalOpen(false);
    setSelectedTransfer(null);
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

  const getFloorName = (floorId?: string): string => {
    if (!floorId) return 'Không xác định';
    const floor = floors.find(f => f.id === floorId);
    return floor ? floor.name : 'Không xác định';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lịch sử chuyển bàn</h2>
        <div className="text-sm text-gray-500">
          Tổng cộng: {filteredTransfers.length} lần chuyển
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold">Bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tầng
            </label>
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả tầng</option>
              {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã bàn, tên khách, lý do..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Transfer History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bàn cũ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bàn mới
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lý do
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người thực hiện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || dateFilter !== 'all' || floorFilter !== 'all'
                      ? 'Không tìm thấy lịch sử chuyển bàn phù hợp'
                      : 'Chưa có lịch sử chuyển bàn nào'}
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(transfer.transferredAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transfer.sourceTableCode}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getFloorName(transfer.sourceFloorId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transfer.targetTableCode}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getFloorName(transfer.targetFloorId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transfer.customerName || 'Không có thông tin'}
                      </div>
                      {transfer.numberOfGuests && (
                        <div className="text-xs text-gray-500">
                          {transfer.numberOfGuests} người
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {transfer.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transfer.transferredBy}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteTransfer(transfer)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTransfer(null);
        }}
        onConfirm={confirmDeleteTransfer}
        title="Xác nhận xóa lịch sử"
        message={`Bạn có chắc chắn muốn xóa lịch sử chuyển bàn từ ${selectedTransfer?.sourceTableCode} sang ${selectedTransfer?.targetTableCode} không?`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default TransferHistory; 