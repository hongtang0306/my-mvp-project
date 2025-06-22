import React, { useState, useEffect } from 'react';
import type { Table, Floor, TableCategory, TableConfig, TableStatus } from '../types/table';
import TableConfigService from '../services/TableConfigService';

const TableConfiguration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tables' | 'floors' | 'categories'>('tables');
  const [tables, setTables] = useState<Table[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [categories, setCategories] = useState<TableCategory[]>([]);
  const [tableConfigs, setTableConfigs] = useState<TableConfig[]>([]);
  
  // Filter states
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort states
  const [sortField, setSortField] = useState<string>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states
  const [tableForm, setTableForm] = useState({
    code: '',
    seats: 4,
    floorId: '',
    categoryId: ''
  });
  const [floorForm, setFloorForm] = useState({
    name: '',
    description: '',
    maxTables: 10,
    isActive: true
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isActive: true
  });
  const [statusForm, setStatusForm] = useState({
    tableId: '',
    newStatus: 'Trống sạch' as TableStatus
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const tableConfigService = TableConfigService.getInstance();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadData();
    tableConfigService.syncWithExistingTables();
  }, []);

  const loadData = () => {
    const storedTables = localStorage.getItem('restaurant-tables');
    if (storedTables) {
      setTables(JSON.parse(storedTables));
    }
    setFloors(tableConfigService.getFloors());
    setCategories(tableConfigService.getCategories());
    setTableConfigs(tableConfigService.getTableConfigs());
  };

  // Filter and sort logic
  const filteredAndSortedTables = React.useMemo(() => {
    let filtered = tables.filter(table => {
      const matchesSearch = table.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           table.zone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFloor = floorFilter === 'all' || table.floorId === floorFilter;
      const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || table.categoryId === categoryFilter;
      
      return matchesSearch && matchesFloor && matchesStatus && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Table];
      let bValue: any = b[sortField as keyof Table];
      
      if (sortField === 'updatedAt' || sortField === 'createdAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tables, searchTerm, floorFilter, statusFilter, categoryFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateTable = () => {
    try {
      if (!tableForm.code || !tableForm.floorId || !tableForm.categoryId) {
        showToast('error', 'Vui lòng điền đầy đủ thông tin');
        return;
      }

      const floor = floors.find(f => f.id === tableForm.floorId);
      const category = categories.find(c => c.id === tableForm.categoryId);
      
      if (!floor || !category) {
        showToast('error', 'Tầng hoặc danh mục không tồn tại');
        return;
      }

      const newTable: Table = {
        id: `table-${Date.now()}`,
        code: tableForm.code,
        zone: floor.name,
        seats: tableForm.seats,
        status: 'Trống sạch',
        floorId: tableForm.floorId,
        categoryId: tableForm.categoryId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin',
        isActive: true
      };

      // Use enhanced sync method
      tableConfigService.syncNewTable(newTable);

      // Update local state
      const updatedTables = [...tables, newTable];
      setTables(updatedTables);
      setTableConfigs(tableConfigService.getTableConfigs());

      setTableForm({ code: '', seats: 4, floorId: '', categoryId: '' });
      setIsTableModalOpen(false);
      showToast('success', 'Tạo bàn thành công!');
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const handleUpdateTable = () => {
    try {
      if (!editingItem || !tableForm.code || !tableForm.floorId || !tableForm.categoryId) {
        showToast('error', 'Vui lòng điền đầy đủ thông tin');
        return;
      }

      const floor = floors.find(f => f.id === tableForm.floorId);
      if (!floor) {
        showToast('error', 'Tầng không tồn tại');
        return;
      }

      const updatedTables = tables.map(table => {
        if (table.id === editingItem.id) {
          return {
            ...table,
            code: tableForm.code,
            zone: floor.name,
            seats: tableForm.seats,
            floorId: tableForm.floorId,
            categoryId: tableForm.categoryId,
            updatedAt: new Date().toISOString(),
            updatedBy: 'admin'
          };
        }
        return table;
      });

      const config = tableConfigs.find(c => c.tableId === editingItem.id);
      if (config) {
        tableConfigService.updateTableConfig(config.id, {
          floorId: tableForm.floorId,
          categoryId: tableForm.categoryId
        }, 'admin');
      }

      localStorage.setItem('restaurant-tables', JSON.stringify(updatedTables));
      setTables(updatedTables);
      setTableConfigs(tableConfigService.getTableConfigs());

      setTableForm({ code: '', seats: 4, floorId: '', categoryId: '' });
      setEditingItem(null);
      setIsTableModalOpen(false);
      showToast('success', 'Cập nhật bàn thành công!');
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const handleDeleteTable = (tableId: string) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table) return;

      if (table.status !== 'Trống sạch') {
        showToast('error', 'Không thể xóa bàn đang được sử dụng');
        return;
      }

      const config = tableConfigs.find(c => c.tableId === tableId);
      if (config) {
        tableConfigService.deleteTableConfig(config.id, 'admin');
      }

      const updatedTables = tables.filter(t => t.id !== tableId);
      localStorage.setItem('restaurant-tables', JSON.stringify(updatedTables));
      setTables(updatedTables);
      setTableConfigs(tableConfigService.getTableConfigs());

      showToast('success', 'Xóa bàn thành công!');
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const handleStatusChange = (tableId: string, newStatus: TableStatus) => {
    try {
      const updatedTables = tables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: 'admin'
          };
        }
        return table;
      });

      localStorage.setItem('restaurant-tables', JSON.stringify(updatedTables));
      setTables(updatedTables);
      
      // Sync with TableConfigService
      tableConfigService.syncTableStatus(tableId, newStatus);
      
      setIsStatusModalOpen(false);
      setStatusForm({ tableId: '', newStatus: 'Trống sạch' });
      showToast('success', 'Cập nhật trạng thái thành công!');
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const handleCreateFloor = () => {
    try {
      if (!floorForm.name) {
        showToast('error', 'Vui lòng nhập tên tầng');
        return;
      }

      tableConfigService.createFloor(floorForm, 'admin');
      setFloors(tableConfigService.getFloors());
      setFloorForm({ name: '', description: '', maxTables: 10, isActive: true });
      setIsFloorModalOpen(false);
      showToast('success', 'Tạo tầng thành công!');
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const handleUpdateFloor = () => {
    try {
      if (!editingItem || !floorForm.name) {
        showToast('error', 'Vui lòng nhập tên tầng');
        return;
      }

      tableConfigService.updateFloor(editingItem.id, floorForm, 'admin');
      setFloors(tableConfigService.getFloors());
      setFloorForm({ name: '', description: '', maxTables: 10, isActive: true });
      setEditingItem(null);
      setIsFloorModalOpen(false);
      showToast('success', 'Cập nhật tầng thành công!');
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const handleDeleteFloor = (floorId: string) => {
    try {
      tableConfigService.deleteFloor(floorId, 'admin');
      setFloors(tableConfigService.getFloors());
      showToast('success', 'Xóa tầng thành công!');
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const handleCreateCategory = () => {
    try {
      if (!categoryForm.name) {
        showToast('error', 'Vui lòng nhập tên danh mục');
        return;
      }

      tableConfigService.createCategory(categoryForm, 'admin');
      setCategories(tableConfigService.getCategories());
      setCategoryForm({ name: '', description: '', color: '#3B82F6', isActive: true });
      setIsCategoryModalOpen(false);
      showToast('success', 'Tạo danh mục thành công!');
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const handleUpdateCategory = () => {
    try {
      if (!editingItem || !categoryForm.name) {
        showToast('error', 'Vui lòng nhập tên danh mục');
        return;
      }

      tableConfigService.updateCategory(editingItem.id, categoryForm, 'admin');
      setCategories(tableConfigService.getCategories());
      setCategoryForm({ name: '', description: '', color: '#3B82F6', isActive: true });
      setEditingItem(null);
      setIsCategoryModalOpen(false);
      showToast('success', 'Cập nhật danh mục thành công!');
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    try {
      tableConfigService.deleteCategory(categoryId, 'admin');
      setCategories(tableConfigService.getCategories());
      showToast('success', 'Xóa danh mục thành công!');
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const openEditModal = (item: any, type: 'table' | 'floor' | 'category') => {
    setEditingItem(item);
    if (type === 'table') {
      setTableForm({
        code: item.code,
        seats: item.seats,
        floorId: item.floorId || '',
        categoryId: item.categoryId || ''
      });
      setIsTableModalOpen(true);
    } else if (type === 'floor') {
      setFloorForm({
        name: item.name,
        description: item.description || '',
        maxTables: item.maxTables,
        isActive: item.isActive
      });
      setIsFloorModalOpen(true);
    } else if (type === 'category') {
      setCategoryForm({
        name: item.name,
        description: item.description || '',
        color: item.color || '#3B82F6',
        isActive: item.isActive
      });
      setIsCategoryModalOpen(true);
    }
  };

  const openStatusModal = (table: Table) => {
    setStatusForm({
      tableId: table.id,
      newStatus: table.status
    });
    setIsStatusModalOpen(true);
  };

  const closeModal = () => {
    setIsTableModalOpen(false);
    setIsFloorModalOpen(false);
    setIsCategoryModalOpen(false);
    setIsStatusModalOpen(false);
    setEditingItem(null);
    setTableForm({ code: '', seats: 4, floorId: '', categoryId: '' });
    setFloorForm({ name: '', description: '', maxTables: 10, isActive: true });
    setCategoryForm({ name: '', description: '', color: '#3B82F6', isActive: true });
    setStatusForm({ tableId: '', newStatus: 'Trống sạch' });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Trống sạch': return 'bg-white border-2 border-gray-300';
      case 'Đã Đặt': return 'bg-yellow-100';
      case 'Đang phục vụ': return 'bg-blue-100';
      case 'Bàn dơ': return 'bg-red-100';
      case 'Bảo trì': return 'bg-orange-100';
      case 'Tạm ngưng': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8">Cấu hình bàn ăn</h1>

      <div className="mb-8">
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
              onClick={() => setActiveTab('floors')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'floors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quản lý tầng
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quản lý danh mục
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'tables' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm bàn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Thêm bàn mới
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo tầng
              </label>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả tầng</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Trống sạch">Trống sạch</option>
                <option value="Đã Đặt">Đã Đặt</option>
                <option value="Đang phục vụ">Đang phục vụ</option>
                <option value="Bàn dơ">Bàn dơ</option>
                <option value="Bảo trì">Bảo trì</option>
                <option value="Tạm ngưng">Tạm ngưng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo danh mục
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center">
                      Mã bàn
                      <SortIcon field="code" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('zone')}
                  >
                    <div className="flex items-center">
                      Tầng
                      <SortIcon field="zone" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('seats')}
                  >
                    <div className="flex items-center">
                      Số ghế
                      <SortIcon field="seats" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Trạng thái
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center">
                      Cập nhật lúc
                      <SortIcon field="updatedAt" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedTables.map((table) => {
                  const floor = floors.find(f => f.id === table.floorId);
                  const category = categories.find(c => c.id === table.categoryId);
                  return (
                    <tr key={table.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {table.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {floor?.name || table.zone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category?.name || 'Chưa phân loại'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table.seats}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(table.status)}`}>
                          {table.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table.updatedAt ? new Date(table.updatedAt).toLocaleString('vi-VN') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(table, 'table')}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => openStatusModal(table)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Trạng thái
                        </button>
                        <button
                          onClick={() => handleDeleteTable(table.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'floors' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Quản lý tầng</h2>
            <button
              onClick={() => setIsFloorModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Thêm tầng mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {floors.map((floor) => (
              <div key={floor.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{floor.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(floor, 'floor')}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteFloor(floor.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{floor.description}</p>
                <p className="text-gray-500 text-sm">Tối đa: {floor.maxTables} bàn</p>
                <p className="text-gray-400 text-xs mt-2">
                  Cập nhật: {new Date(floor.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Quản lý danh mục bàn</h2>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Thêm danh mục mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(category, 'category')}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                <p className="text-gray-400 text-xs">
                  Cập nhật: {new Date(category.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Sửa bàn' : 'Thêm bàn mới'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã bàn
                </label>
                <input
                  type="text"
                  value={tableForm.code}
                  onChange={(e) => setTableForm({ ...tableForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: T1-01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số ghế
                </label>
                <input
                  type="number"
                  value={tableForm.seats}
                  onChange={(e) => setTableForm({ ...tableForm, seats: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tầng
                </label>
                <select
                  value={tableForm.floorId}
                  onChange={(e) => setTableForm({ ...tableForm, floorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn tầng</option>
                  {floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={tableForm.categoryId}
                  onChange={(e) => setTableForm({ ...tableForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={editingItem ? handleUpdateTable : handleCreateTable}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {editingItem ? 'Cập nhật' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isFloorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Sửa tầng' : 'Thêm tầng mới'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tầng
                </label>
                <input
                  type="text"
                  value={floorForm.name}
                  onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Tầng 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={floorForm.description}
                  onChange={(e) => setFloorForm({ ...floorForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả tầng..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số bàn tối đa
                </label>
                <input
                  type="number"
                  value={floorForm.maxTables}
                  onChange={(e) => setFloorForm({ ...floorForm, maxTables: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="20"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={editingItem ? handleUpdateFloor : handleCreateFloor}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {editingItem ? 'Cập nhật' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Bàn thường"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả danh mục..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Màu sắc
                </label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={editingItem ? handleUpdateCategory : handleCreateCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {editingItem ? 'Cập nhật' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Thay đổi trạng thái bàn</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái mới
                </label>
                <select
                  value={statusForm.newStatus}
                  onChange={(e) => setStatusForm({ ...statusForm, newStatus: e.target.value as TableStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Trống sạch">Trống sạch</option>
                  <option value="Đã Đặt">Đã Đặt</option>
                  <option value="Đang phục vụ">Đang phục vụ</option>
                  <option value="Bàn dơ">Bàn dơ</option>
                  <option value="Bảo trì">Bảo trì</option>
                  <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleStatusChange(statusForm.tableId, statusForm.newStatus)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableConfiguration; 