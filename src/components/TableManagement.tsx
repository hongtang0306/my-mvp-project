import React, { useState, useMemo, useEffect } from 'react';
import type { Table, TableStatus, BookingFormData, OrderItem, Floor } from '../types/table';
import BookingModal from './BookingModal';
import StatusChangeModal from './StatusChangeModal';
import PaymentModal from './PaymentModal';
import TableDetailsModal from './TableDetailsModal';
import TransferTableModal from './TransferTableModal';
import TransferHistory from './TransferHistory';
import TableConfigService from '../services/TableConfigService'; // Import a service
import TableTransferService from '../services/tableTransferService';

const TableManagement: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'tables' | 'transfer-history'>('tables');

  // Filter states
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'all'>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [tableTypeFilter, setTableTypeFilter] = useState<string>('all');

  // Dữ liệu mẫu cho các bàn theo tầng
  const [tables, setTables] = useState<Table[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]); // New state for floors
  const [categories, setCategories] = useState<any[]>([]); // New state for categories

  // Modal states
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  // Dữ liệu mẫu cho các bàn theo tầng (dữ liệu ban đầu)
  const initialTables: Table[] = [
    // Tầng 1
    {
      id: '101',
      code: 'T1-01',
      seats: 4,
      zone: 'Tầng 1',
      status: 'Trống sạch'
    },
    {
      id: '102',
      code: 'T1-02',
      seats: 6,
      zone: 'Tầng 1',
      status: 'Đang phục vụ',
      orderItems: [
        { id: '1', name: 'Phở bò', quantity: 2, price: 50000, category: 'Món chính' },
        { id: '2', name: 'Nước ngọt', quantity: 2, price: 15000, category: 'Đồ uống' }
      ],
      booking: {
        customerName: 'Nguyễn Văn A',
        phoneNumber: '0123456789',
        reservationTime: '2024-03-20T18:30',
        numberOfGuests: 4
      }
    },
    {
      id: '103',
      code: 'T1-03',
      seats: 8,
      zone: 'Tầng 1',
      status: 'Đã Đặt',
      booking: {
        customerName: 'Trần Thị B',
        phoneNumber: '0987654321',
        reservationTime: '2024-03-20T19:00',
        numberOfGuests: 6
      }
    },
    {
      id: '104',
      code: 'T1-04',
      seats: 4,
      zone: 'Tầng 1',
      status: 'Bàn dơ'
    },
    // Tầng 2
    {
      id: '201',
      code: 'T2-01',
      seats: 4,
      zone: 'Tầng 2',
      status: 'Trống sạch'
    },
    {
      id: '202',
      code: 'T2-02',
      seats: 6,
      zone: 'Tầng 2',
      status: 'Đang phục vụ',
      orderItems: [
        { id: '3', name: 'Bún bò', quantity: 3, price: 45000, category: 'Món chính' },
        { id: '4', name: 'Bia', quantity: 4, price: 20000, category: 'Đồ uống' }
      ],
      booking: {
        customerName: 'Lê Văn C',
        phoneNumber: '0909123456',
        reservationTime: '2024-03-20T18:00',
        numberOfGuests: 5
      }
    },
    {
      id: '203',
      code: 'T2-03',
      seats: 4,
      zone: 'Tầng 2',
      status: 'Đã Đặt',
      booking: {
        customerName: 'Phạm Thị D',
        phoneNumber: '0918234567',
        reservationTime: '2024-03-20T19:30',
        numberOfGuests: 4
      }
    },
    {
      id: '204',
      code: 'T2-04',
      seats: 6,
      zone: 'Tầng 2',
      status: 'Bàn dơ'
    },
    // Tầng 3
    {
      id: '301',
      code: 'T3-01',
      seats: 8,
      zone: 'Tầng 3 - VIP',
      status: 'Trống sạch'
    },
    {
      id: '302',
      code: 'T3-02',
      seats: 10,
      zone: 'Tầng 3 - VIP',
      status: 'Đang phục vụ',
      orderItems: [
        { id: '5', name: 'Lẩu thái', quantity: 1, price: 350000, category: 'Món chính' },
        { id: '6', name: 'Rượu vang', quantity: 1, price: 500000, category: 'Đồ uống' }
      ],
      booking: {
        customerName: 'Hoàng Văn E',
        phoneNumber: '0977888999',
        reservationTime: '2024-03-20T19:00',
        numberOfGuests: 8,
        specialNotes: 'Khách VIP - Cần phòng riêng'
      }
    },
    {
      id: '303',
      code: 'T3-03',
      seats: 12,
      zone: 'Tầng 3 - VIP',
      status: 'Đã Đặt',
      booking: {
        customerName: 'Đỗ Thị F',
        phoneNumber: '0866777888',
        reservationTime: '2024-03-20T20:00',
        numberOfGuests: 10,
        specialNotes: 'Tiệc sinh nhật'
      }
    },
    {
      id: '304',
      code: 'T3-04',
      seats: 8,
      zone: 'Tầng 3 - VIP',
      status: 'Bàn dơ'
    }
  ];

  // Initialize data from services and localStorage
  useEffect(() => {
    const tableConfigService = TableConfigService.getInstance();
    const storedFloors = tableConfigService.getFloors();
    const storedCategories = tableConfigService.getCategories();
    setFloors(storedFloors);
    setCategories(storedCategories);

    const storedTables = localStorage.getItem('restaurant-tables');
    if (storedTables) {
      setTables(JSON.parse(storedTables));
    } else {
      localStorage.setItem('restaurant-tables', JSON.stringify(initialTables));
      setTables(initialTables);
      // Sync initial tables with config service
      tableConfigService.syncWithExistingTables();
    }
  }, []);

  // Sync selectedTable with the main tables list to ensure data is always fresh
  useEffect(() => {
    if (selectedTable) {
      const updatedSelectedTable = tables.find(t => t.id === selectedTable.id);
      if (updatedSelectedTable) {
        // Prevent re-render if data is identical
        if (JSON.stringify(updatedSelectedTable) !== JSON.stringify(selectedTable)) {
          setSelectedTable(updatedSelectedTable);
        }
      } else {
        // If table is not found (e.g., deleted), close details
        setSelectedTable(null);
        setIsDetailsModalOpen(false);
      }
    }
  }, [tables, selectedTable]);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    if (table.status === 'Trống sạch') {
      setIsBookingModalOpen(true);
    } else if (table.status === 'Bảo trì' || table.status === 'Tạm ngưng') {
      // For maintenance or suspended tables, allow changing status
      setIsStatusModalOpen(true);
    } else {
      setIsDetailsModalOpen(true);
    }
  };

  const handleCreateBooking = (tableId: string, bookingData: BookingFormData) => {
    setTables(prevTables => {
      const updatedTables = prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            status: 'Đã Đặt' as TableStatus,
            booking: bookingData
          };
        }
        return table;
      });
      
      localStorage.setItem('restaurant-tables', JSON.stringify(updatedTables));
      return updatedTables;
    });
    setIsBookingModalOpen(false);
    setSelectedTable(null);
    showToast('success', 'Đặt bàn thành công!');
  };

  const handleStatusChange = (tableId: string, newStatus: TableStatus, bookingData?: BookingFormData) => {
    setTables(prevTables => {
      const updatedTables = prevTables.map(table => {
        if (table.id === tableId) {
          const updatedTable = { ...table, status: newStatus };

          if (newStatus === 'Trống sạch') {
            delete updatedTable.booking;
            delete updatedTable.orderItems;
          }

          if (newStatus === 'Đã Đặt' && bookingData) {
            updatedTable.booking = bookingData;
          }

          if (newStatus === 'Đang phục vụ') {
            if (!updatedTable.orderItems) {
              updatedTable.orderItems = [];
            }
          }

          return updatedTable;
        }
        return table;
      });
      
      localStorage.setItem('restaurant-tables', JSON.stringify(updatedTables));
      return updatedTables;
    });
    setIsStatusModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedTable(null);
    showToast('success', 'Cập nhật trạng thái thành công!');
  };

  const handlePaymentComplete = (tableId: string) => {
    setTables(prevTables => {
      const updatedTables = prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            status: 'Bàn dơ' as TableStatus,
            orderItems: undefined
          };
        }
        return table;
      });
      
      localStorage.setItem('restaurant-tables', JSON.stringify(updatedTables));
      return updatedTables;
    });
    setIsPaymentModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedTable(null);
    showToast('success', 'Thanh toán thành công!');
  };

  const handleUpdateOrder = (tableId: string, items: OrderItem[]) => {
    setTables(prevTables => {
      const updatedTables = prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            orderItems: items,
            status: table.status === 'Đã Đặt' ? 'Đang phục vụ' : table.status,
          };
        }
        return table;
      });
      
      localStorage.setItem('restaurant-tables', JSON.stringify(updatedTables));
      return updatedTables;
    });
  };

  const handleTransferClick = () => {
    setIsDetailsModalOpen(false);
    setIsTransferModalOpen(true);
  };

  const handleTransferComplete = () => {
    // Reload tables from localStorage to get the updated data
    const storedTables = localStorage.getItem('restaurant-tables');
    if (storedTables) {
      setTables(JSON.parse(storedTables));
    }
    
    // Close transfer modal
    setIsTransferModalOpen(false);
    setSelectedTable(null);
  };

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
      case 'Bảo trì':
        return 'bg-orange-100';
      case 'Tạm ngưng':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Filter functions
  const filteredTables = useMemo(() => {
    return tables.filter(table => {
      const floor = floors.find(f => f.id === table.floorId);
      const tableConfigService = TableConfigService.getInstance();
      const tableConfig = tableConfigService.getTableConfigByTableId(table.id);
      const category = tableConfig ? tableConfigService.getCategoryById(tableConfig.categoryId) : null;
      
      const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
      const matchesFloor = floorFilter === 'all' || table.floorId === floorFilter;
      const matchesType = tableTypeFilter === 'all' || 
        (tableConfig && tableConfig.categoryId === tableTypeFilter);
      
      return matchesStatus && matchesFloor && matchesType;
    });
  }, [tables, statusFilter, floorFilter, tableTypeFilter, floors]);

  // Get unique floors and table types for filters
  const filterFloors = useMemo(() => {
    const uniqueFloors = new Map<string, string>();
    floors.forEach(floor => uniqueFloors.set(floor.id, floor.name));
    return Array.from(uniqueFloors.entries()).map(([id, name]) => ({ id, name }));
  }, [floors]);

  // Get unique categories for filters
  const filterCategories = useMemo(() => {
    return categories.map(category => ({ id: category.id, name: category.name }));
  }, [categories]);

  return (
    <div className="container mx-auto px-4 py-8">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8">Quản lý bàn</h1>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tables')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tables'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quản lý bàn
            </button>
            <button
              onClick={() => setActiveTab('transfer-history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transfer-history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lịch sử chuyển bàn
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'tables' ? (
        <>
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-4">Bộ lọc:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tầng
                </label>
                <select
                  value={floorFilter}
                  onChange={(e) => setFloorFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Tất cả</option>
                  {filterFloors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại bàn
                </label>
                <select
                  value={tableTypeFilter}
                  onChange={(e) => setTableTypeFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Tất cả</option>
                  {filterCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-2">Chú thích:</h3>
            <div className="flex flex-wrap gap-4">
              <div
                className={`flex items-center cursor-pointer ${statusFilter === 'Trống sạch' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'Trống sạch' ? 'all' : 'Trống sạch')}
              >
                <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded mr-2"></div>
                <span>Trống sạch</span>
              </div>
              <div
                className={`flex items-center cursor-pointer ${statusFilter === 'Đã Đặt' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'Đã Đặt' ? 'all' : 'Đã Đặt')}
              >
                <div className="w-6 h-6 bg-yellow-100 border-2 border-gray-300 rounded mr-2"></div>
                <span>Đã đặt</span>
              </div>
              <div
                className={`flex items-center cursor-pointer ${statusFilter === 'Đang phục vụ' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'Đang phục vụ' ? 'all' : 'Đang phục vụ')}
              >
                <div className="w-6 h-6 bg-blue-100 border-2 border-gray-300 rounded mr-2"></div>
                <span>Đang phục vụ</span>
              </div>
              <div
                className={`flex items-center cursor-pointer ${statusFilter === 'Bàn dơ' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'Bàn dơ' ? 'all' : 'Bàn dơ')}
              >
                <div className="w-6 h-6 bg-red-100 border-2 border-gray-300 rounded mr-2"></div>
                <span>Bàn dơ</span>
              </div>
              <div
                className={`flex items-center cursor-pointer ${statusFilter === 'Bảo trì' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'Bảo trì' ? 'all' : 'Bảo trì')}
              >
                <div className="w-6 h-6 bg-orange-100 border-2 border-gray-300 rounded mr-2"></div>
                <span>Bảo trì</span>
              </div>
              <div
                className={`flex items-center cursor-pointer ${statusFilter === 'Tạm ngưng' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'Tạm ngưng' ? 'all' : 'Tạm ngưng')}
              >
                <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded mr-2"></div>
                <span>Tạm ngưng</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {floors.filter(floor => floorFilter === 'all' || floor.id === floorFilter).map((floor) => {
              const zoneTables = filteredTables.filter(table => table.floorId === floor.id || table.zone === floor.name);
              return (
                <div key={floor.id} className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">{floor.name}</h2>
                  {zoneTables.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {zoneTables.map((table) => {
                    const tableConfigService = TableConfigService.getInstance();
                    const tableConfig = tableConfigService.getTableConfigByTableId(table.id);
                    const category = tableConfig ? tableConfigService.getCategoryById(tableConfig.categoryId) : null;
                    
                    return (
                      <div
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`${getStatusColor(
                          table.status
                        )} p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                      >
                        <div className="text-center">
                          <h3 className="font-semibold">{table.code}</h3>
                          <p className="text-sm text-gray-600">{table.seats} chỗ</p>
                          {category && (
                            <p className="text-xs text-gray-500 mt-1">{category.name}</p>
                          )}
                          <p className="text-xs mt-1 font-medium">{table.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                  ) : (
                    <p className="text-gray-500">Không có bàn nào trong khu vực này.</p>
                  )}
              </div>
              );
            })}
          </div>
        </>
      ) : (
        <TransferHistory floors={floors} />
      )}

      {selectedTable && (
        <>
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            onSubmit={(data) => handleCreateBooking(selectedTable.id, data)}
            tableCode={selectedTable.code}
          />

          <StatusChangeModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            table={selectedTable}
            onStatusChange={(status, bookingData) => { handleStatusChange(selectedTable.id, status, bookingData); showToast('success', 'Cập nhật trạng thái thành công!'); }}
            showToast={showToast}
          />

          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onPaymentComplete={(...args) => { handlePaymentComplete(selectedTable.id); showToast('success', 'Thanh toán thành công!'); }}
            table={selectedTable}
            showToast={showToast}
          />

          <TableDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            table={selectedTable}
            onStatusChange={(status, bookingData) => handleStatusChange(selectedTable.id, status, bookingData)}
            onPaymentClick={() => {
              setIsPaymentModalOpen(true);
            }}
            onUpdateOrder={(items) => handleUpdateOrder(selectedTable.id, items)}
            onTransferClick={() => setIsTransferModalOpen(true)}
          />

          <TransferTableModal
            isOpen={isTransferModalOpen}
            onClose={() => setIsTransferModalOpen(false)}
            sourceTable={selectedTable}
            allTables={tables}
            floors={floors}
            onTransferComplete={handleTransferComplete}
            showToast={showToast}
          />
        </>
      )}
    </div>
  );
};

export default TableManagement; 