import React from 'react';
import type { Table } from '../../types/table';

interface TableGridProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
}

const TableGrid: React.FC<TableGridProps> = ({ tables, onTableClick }) => {
  const getStatusColor = (status: Table['status']): string => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => (
        <div
          key={table.id}
          onClick={() => onTableClick(table)}
          className={`${getStatusColor(
            table.status
          )} p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">Bàn #{table.number}</h3>
            <span className="text-sm text-gray-600">{table.seats} chỗ</span>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">{table.status}</div>

            {table.currentBooking && (
              <div className="text-sm text-gray-600 space-y-1">
                <div>Khách: {table.currentBooking.customerName}</div>
                <div>SĐT: {table.currentBooking.phoneNumber}</div>
                <div>
                  Thời gian:{' '}
                  {new Date(table.currentBooking.reservationTime).toLocaleString('vi-VN')}
                </div>
                <div>Số khách: {table.currentBooking.numberOfGuests}</div>
                {table.currentBooking.specialNotes && (
                  <div className="text-xs italic">
                    Ghi chú: {table.currentBooking.specialNotes}
                  </div>
                )}
              </div>
            )}

            {table.status === 'Đang phục vụ' && table.orderDetails && (
              <div className="mt-2 text-sm">
                <div className="font-medium">Đơn hàng #{table.orderDetails.orderId}</div>
                <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                  {table.orderDetails.items.map((item, index) => (
                    <li key={index}>
                      {item.name} x{item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableGrid; 