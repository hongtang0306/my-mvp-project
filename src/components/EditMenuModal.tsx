import React, { useState, useEffect } from 'react';
import type { MenuItem, Category, MenuValidationErrors } from '../types/menu';
import ImageUpload from './ImageUpload';

interface EditMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name?: string; description?: string; price?: number; categoryId?: string; status?: 'available' | 'unavailable'; images?: string[] }) => void;
  menuItem: MenuItem;
  categories: Category[];
}

const EditMenuModal: React.FC<EditMenuModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  menuItem,
  categories,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<MenuValidationErrors>({});

  // Initialize form data when menuItem changes
  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name,
        description: menuItem.description || '',
        price: menuItem.price.toString(),
        categoryId: menuItem.categoryId,
      });
      setImages(menuItem.images || []);
      setErrors({});
    }
  }, [menuItem]);

  const validateForm = (): boolean => {
    const newErrors: MenuValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên món ăn';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Vui lòng nhập giá món ăn';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Giá món ăn phải lớn hơn 0';
      }
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Vui lòng chọn danh mục';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const updateData: { name?: string; description?: string; price?: number; categoryId?: string; status?: 'available' | 'unavailable'; images?: string[] } = {};
      
      // Only include changed fields
      if (formData.name.trim() !== menuItem.name) {
        updateData.name = formData.name.trim();
      }
      if (formData.description.trim() !== (menuItem.description || '')) {
        updateData.description = formData.description.trim() || undefined;
      }
      if (parseFloat(formData.price) !== menuItem.price) {
        updateData.price = parseFloat(formData.price);
      }
      if (formData.categoryId !== menuItem.categoryId) {
        updateData.categoryId = formData.categoryId;
      }
      
      // Check if images changed
      const currentImages = menuItem.images || [];
      if (JSON.stringify(images) !== JSON.stringify(currentImages)) {
        updateData.images = images;
      }
      
      onSubmit(updateData);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Chỉnh sửa món ăn</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tên món ăn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên món ăn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full p-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Nhập tên món ăn"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Nhập mô tả món ăn (tùy chọn)"
              />
            </div>

            {/* Giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={`w-full p-2 border rounded-md ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Nhập giá món ăn"
                min="0"
                step="1000"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Danh mục */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className={`w-full p-2 border rounded-md ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            {/* Hình ảnh */}
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={1}
              maxSizeMB={200}
            />

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="available"
                    checked={menuItem.status === 'available'}
                    onChange={() => onSubmit({ status: 'available' })}
                    className="mr-2"
                  />
                  <span className="text-sm">Có sẵn</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="unavailable"
                    checked={menuItem.status === 'unavailable'}
                    onChange={() => onSubmit({ status: 'unavailable' })}
                    className="mr-2"
                  />
                  <span className="text-sm">Ngừng phục vụ</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMenuModal; 