export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  status: 'available' | 'unavailable';
  images?: string[]; // Array of image URLs/data URLs
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  images?: string[];
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  status?: 'available' | 'unavailable';
  images?: string[];
}

export interface MenuValidationErrors {
  name?: string;
  price?: string;
  categoryId?: string;
  images?: string;
}

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'kv', name: 'Khai vị', description: 'Các món khai vị' },
  { id: 'mc', name: 'Món chính', description: 'Các món chính' },
  { id: 'l', name: 'Lẩu', description: 'Các món lẩu' },
  { id: 'du', name: 'Đồ uống', description: 'Các loại đồ uống' },
  { id: 'tm', name: 'Tráng miệng', description: 'Các món tráng miệng' },
]; 