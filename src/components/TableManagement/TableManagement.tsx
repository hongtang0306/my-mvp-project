import React, { useState } from 'react';
import type { Table, TableStatus, TableBookingFormData } from '../../types/table';
import BookingModal from './BookingModal';
import TableStatusModal from './TableStatusModal';
import TableGrid from './TableGrid';

const TableManagement: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([
    { id: '1', number: 1, seats: 4, status: 'Trống sạch' },
    { id: '2', number: 2, seats: 6, status: 'Trống sạch' },
    // Add more initial tables as needed
  ]);

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    if (table.status === 'Trống sạch') {
      setIsBookingModalOpen(true);
    } else {
      setIsStatusModalOpen(true);
    }
  };

  const handleCreateBooking = (tableId: string, bookingData: TableBookingFormData) => {
    setTables(prevTables =>
      prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            status: 'Đã Đặt' as TableStatus,
            currentBooking: {
              id: Math.random().toString(36).substr(2, 9),
              ...bookingData,
              createdAt: new Date(),
            },
          };
        }
        return table;
      })
    );
    setIsBookingModalOpen(false);
  };

  const handleStatusChange = (tableId: string, newStatus: TableStatus) => {
    setTables(prevTables =>
      prevTables.map(table => {
        if (table.id === tableId) {
          const updatedTable = { ...table, status: newStatus };
          // Clear booking if table becomes empty
          if (newStatus === 'Trống sạch') {
            delete updatedTable.currentBooking;
            delete updatedTable.orderDetails;
          }
          return updatedTable;
        }
        return table;
      })
    );
    setIsStatusModalOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý bàn</h1>
      
      <TableGrid 
        tables={tables} 
        onTableClick={handleTableClick} 
      />

      {selectedTable && (
        <>
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            onSubmit={(data: TableBookingFormData) => handleCreateBooking(selectedTable.id, data)}
            table={selectedTable}
          />

          <TableStatusModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            onStatusChange={(status: TableStatus) => handleStatusChange(selectedTable.id, status)}
            currentStatus={selectedTable.status}
          />
        </>
      )}
    </div>
  );
};

export default TableManagement; 