import React from 'react';
import type { TableStatus } from '../../types/table';

interface TableStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: TableStatus) => void;
  currentStatus: TableStatus;
}

const TableStatusModal: React.FC<TableStatusModalProps> = ({
  isOpen,
  onClose,
  onStatusChange,
  currentStatus,
}) => {
  const statuses: TableStatus[] = ['Trống sạch', 'Đã Đặt', 'Đang phục vụ', 'Bàn dơ'];

  const getStatusColor = (status: TableStatus): string => {
    switch (status) {
      case 'Trống sạch':
        return 'bg-white border-2 border-gray-300';
      case 'Đã Đặt':
        return 'bg-yellow-100';
      case 'Đang phục vụ':
        return 'bg-blue-100';
      case 'Bàn dơ':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Thay đổi trạng thái bàn</h2>
        
        <div className="space-y-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => {
                onStatusChange(status);
                onClose();
              }}
              className={`w-full p-3 rounded-md text-left ${
                getStatusColor(status)
              } ${
                currentStatus === status
                  ? 'ring-2 ring-blue-500'
                  : 'hover:bg-opacity-80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableStatusModal; 