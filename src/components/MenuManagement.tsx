import React, { useState, useEffect } from 'react';
import type { MenuItem, Category } from '../types/menu';
import MenuService from '../services/menuService';
import CreateMenuModal from './CreateMenuModal';
import EditMenuModal from './EditMenuModal';
import ConfirmationModal from './ConfirmationModal';

type SortField = 'name' | 'price' | 'category' | 'status' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const menuService = MenuService.getInstance();

  useEffect(() => {
    loadMenuData();
    
    // Subscribe to menu changes
    const unsubscribe = menuService.subscribe(() => {
      loadMenuData();
    });

    return unsubscribe;
  }, []);

  const loadMenuData = () => {
    setMenuItems(menuService.getAllMenuItems());
    setCategories(menuService.getAllCategories());
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateMenuItem = (data: { name: string; description?: string; price: number; categoryId: string; images?: string[] }) => {
    try {
      menuService.createMenuItem(data);
      showToast('success', 'Tạo món ăn mới thành công!');
      setIsCreateModalOpen(false);
    } catch (error) {
      showToast('error', 'Có lỗi xảy ra khi tạo món ăn!');
    }
  };

  const handleEditMenuItem = (data: { name?: string; description?: string; price?: number; categoryId?: string; status?: 'available' | 'unavailable'; images?: string[] }) => {
    if (!selectedMenuItem) return;
    
    try {
      const updated = menuService.updateMenuItem(selectedMenuItem.id, data);
      if (updated) {
        showToast('success', 'Cập nhật món ăn thành công!');
        setIsEditModalOpen(false);
        setSelectedMenuItem(null);
      } else {
        showToast('error', 'Không tìm thấy món ăn để cập nhật!');
      }
    } catch (error) {
      showToast('error', 'Có lỗi xảy ra khi cập nhật món ăn!');
    }
  };

  const handleDeleteMenuItem = () => {
    if (!selectedMenuItem) return;
    
    try {
      // Check if menu item is used in any orders
      if (menuService.isMenuItemUsedInOrders(selectedMenuItem.id)) {
        showToast('error', 'Không thể xóa món ăn đang được sử dụng trong đơn hàng!');
        setIsDeleteModalOpen(false);
        setSelectedMenuItem(null);
        return;
      }
      
      const success = menuService.deleteMenuItem(selectedMenuItem.id);
      if (success) {
        showToast('success', 'Xóa món ăn thành công!');
      } else {
        showToast('error', 'Không tìm thấy món ăn để xóa!');
      }
      setIsDeleteModalOpen(false);
      setSelectedMenuItem(null);
    } catch (error) {
      showToast('error', 'Có lỗi xảy ra khi xóa món ăn!');
    }
  };

  const handleEditClick = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setIsDeleteModalOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Không xác định';
  };

  // Filter and sort menu items
  const filteredAndSortedMenuItems = menuItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'category':
          // Add safety check for categories
          if (!categories || categories.length === 0) {
            return 0;
          }
          aValue = getCategoryName(a.categoryId).toLowerCase();
          bValue = getCategoryName(b.categoryId).toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const getStatusBadge = (status: string) => {
    return status === 'available' ? (
      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Có sẵn</span>
    ) : (
      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Ngừng phục vụ</span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Statistics
  const totalItems = menuItems.length;
  const availableItems = menuItems.filter(item => item.status === 'available').length;
  const unavailableItems = menuItems.filter(item => item.status === 'unavailable').length;
  const totalCategories = categories.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Menu</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Tạo món mới
        </button>
      </div>

      {/* Statistics - Moved to top */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Tổng số món</h3>
          <p className="text-3xl font-bold text-blue-600">{totalItems}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Món có sẵn</h3>
          <p className="text-3xl font-bold text-green-600">{availableItems}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Ngừng phục vụ</h3>
          <p className="text-3xl font-bold text-red-600">{unavailableItems}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Danh mục</h3>
          <p className="text-3xl font-bold text-purple-600">{totalCategories}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-4">Bộ lọc:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm món ăn
            </label>
            <input
              type="text"
              placeholder="Nhập tên món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Có sẵn</option>
              <option value="unavailable">Ngừng phục vụ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hình ảnh
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tên món</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Danh mục</span>
                    {getSortIcon('category')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Giá</span>
                    {getSortIcon('price')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Trạng thái</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Cập nhật lần cuối</span>
                    {getSortIcon('updatedAt')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedMenuItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                      ? 'Không tìm thấy món ăn phù hợp' 
                      : 'Chưa có món ăn nào trong menu'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedMenuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.description || 'Không có mô tả'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCategoryName(item.categoryId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.price.toLocaleString()}đ
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(item.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.updatedBy || 'Hệ thống'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateMenuModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMenuItem}
        categories={categories}
      />

      {selectedMenuItem && (
        <EditMenuModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedMenuItem(null);
          }}
          onSubmit={handleEditMenuItem}
          menuItem={selectedMenuItem}
          categories={categories}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMenuItem(null);
        }}
        onConfirm={handleDeleteMenuItem}
        title="Xác nhận xóa món ăn"
        message={`Bạn có chắc chắn muốn xóa món "${selectedMenuItem?.name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default MenuManagement; 