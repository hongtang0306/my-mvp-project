import type { MenuItem, Category, CreateMenuItemData, UpdateMenuItemData } from '../types/menu';
import { DEFAULT_CATEGORIES } from '../types/menu';

class MenuService {
  private static instance: MenuService;
  private menuItems: MenuItem[] = [];
  private categories: Category[] = [];
  private listeners: (() => void)[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): MenuService {
    if (!MenuService.instance) {
      MenuService.instance = new MenuService();
    }
    return MenuService.instance;
  }

  // Subscribe to changes
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  private loadFromStorage(): void {
    try {
      const storedMenu = localStorage.getItem('restaurant-menu');
      const storedCategories = localStorage.getItem('restaurant-categories');
      
      if (storedMenu) {
        this.menuItems = JSON.parse(storedMenu);
      } else {
        // Initialize with default menu items
        this.initializeDefaultMenu();
      }
      
      if (storedCategories) {
        this.categories = JSON.parse(storedCategories);
      } else {
        this.categories = [...DEFAULT_CATEGORIES];
        this.saveCategoriesToStorage();
      }
    } catch (error) {
      console.error('Error loading menu from storage:', error);
      this.initializeDefaultMenu();
      this.categories = [...DEFAULT_CATEGORIES];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('restaurant-menu', JSON.stringify(this.menuItems));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving menu to storage:', error);
    }
  }

  private saveCategoriesToStorage(): void {
    try {
      localStorage.setItem('restaurant-categories', JSON.stringify(this.categories));
    } catch (error) {
      console.error('Error saving categories to storage:', error);
    }
  }

  private initializeDefaultMenu(): void {
    // Danh sách mock images đẹp, đa dạng
    const mockImages = [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1523987355523-c7b5b0723c6a?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1514512364185-4c2b67857b39?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
    ];
    let mockIndex = 0;

    const defaultMenu: MenuItem[] = [
      // Món khai vị
      {
        id: 'kv1',
        name: 'Gỏi cuốn tôm thịt',
        description: 'Gỏi cuốn tươi với tôm, thịt heo và rau sống',
        price: 55000,
        categoryId: 'kv',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'kv2',
        name: 'Chả giò hải sản',
        description: 'Chả giò giòn rụm nhân hải sản',
        price: 65000,
        categoryId: 'kv',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'kv3',
        name: 'Gỏi xoài tôm khô',
        description: 'Gỏi xoài chua ngọt với tôm khô',
        price: 85000,
        categoryId: 'kv',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'kv4',
        name: 'Salad cá hồi',
        description: 'Salad với cá hồi Na Uy tươi',
        price: 125000,
        categoryId: 'kv',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      
      // Món chính
      {
        id: 'mc1',
        name: 'Cơm chiên hải sản',
        description: 'Cơm chiên với hải sản tươi sống',
        price: 150000,
        categoryId: 'mc',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'mc2',
        name: 'Bò lúc lắc',
        description: 'Bò Úc xào với sốt đặc biệt',
        price: 185000,
        categoryId: 'mc',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'mc3',
        name: 'Cá hồi sốt teriyaki',
        description: 'Cá hồi Na Uy với sốt teriyaki',
        price: 220000,
        categoryId: 'mc',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'mc4',
        name: 'Gà nướng sả',
        description: 'Gà ta nướng với sả và gia vị đặc biệt',
        price: 165000,
        categoryId: 'mc',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      
      // Món lẩu
      {
        id: 'l1',
        name: 'Lẩu hải sản (S)',
        description: 'Lẩu hải sản cho 2-3 người',
        price: 350000,
        categoryId: 'l',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'l2',
        name: 'Lẩu hải sản (L)',
        description: 'Lẩu hải sản cho 4-6 người',
        price: 450000,
        categoryId: 'l',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'l3',
        name: 'Lẩu thái (S)',
        description: 'Lẩu thái chua cay cho 2-3 người',
        price: 300000,
        categoryId: 'l',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'l4',
        name: 'Lẩu thái (L)',
        description: 'Lẩu thái chua cay cho 4-6 người',
        price: 400000,
        categoryId: 'l',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      
      // Đồ uống
      {
        id: 'du1',
        name: 'Nước cam ép',
        description: 'Nước cam tươi ép',
        price: 35000,
        categoryId: 'du',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'du2',
        name: 'Sinh tố dâu',
        description: 'Sinh tố dâu tây tươi',
        price: 45000,
        categoryId: 'du',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'du3',
        name: 'Trà đào',
        description: 'Trà đào mát lạnh',
        price: 25000,
        categoryId: 'du',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'du4',
        name: 'Bia tươi',
        description: 'Bia tươi lạnh',
        price: 55000,
        categoryId: 'du',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      
      // Tráng miệng
      {
        id: 'tm1',
        name: 'Chè thái',
        description: 'Chè thái thơm ngon',
        price: 45000,
        categoryId: 'tm',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'tm2',
        name: 'Bánh flan',
        description: 'Bánh flan caramel',
        price: 35000,
        categoryId: 'tm',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'tm3',
        name: 'Trái cây thập cẩm',
        description: 'Đĩa trái cây tươi theo mùa',
        price: 65000,
        categoryId: 'tm',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
      {
        id: 'tm4',
        name: 'Kem vanilla',
        description: 'Kem vanilla với sốt chocolate',
        price: 35000,
        categoryId: 'tm',
        status: 'available',
        images: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'Hệ thống',
      },
    ];

    // Gán mock image cho món nào chưa có ảnh
    defaultMenu.forEach(item => {
      if (!item.images || item.images.length === 0) {
        item.images = [mockImages[mockIndex % mockImages.length]];
        mockIndex++;
      }
    });
    
    this.menuItems = defaultMenu;
    this.saveToStorage();
  }

  // Menu Items CRUD
  public getAllMenuItems(): MenuItem[] {
    return [...this.menuItems];
  }

  public getAvailableMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => item.status === 'available');
  }

  public getMenuItemsByCategory(categoryId: string): MenuItem[] {
    return this.menuItems.filter(item => item.categoryId === categoryId && item.status === 'available');
  }

  public getMenuItemById(id: string): MenuItem | undefined {
    return this.menuItems.find(item => item.id === id);
  }

  public createMenuItem(data: CreateMenuItemData): MenuItem {
    const newItem: MenuItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: 'Hệ thống',
    };
    
    this.menuItems.push(newItem);
    this.saveToStorage();
    return newItem;
  }

  public updateMenuItem(id: string, data: UpdateMenuItemData): MenuItem | null {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    this.menuItems[index] = {
      ...this.menuItems[index],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Hệ thống',
    };
    
    this.saveToStorage();
    return this.menuItems[index];
  }

  public deleteMenuItem(id: string): boolean {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.menuItems.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Check if menu item is used in any orders
  public isMenuItemUsedInOrders(menuItemId: string): boolean {
    // Get all tables from localStorage to check if menu item is used
    try {
      const storedTables = localStorage.getItem('restaurant-tables');
      if (storedTables) {
        const tables = JSON.parse(storedTables);
        return tables.some((table: any) => 
          table.orderItems && table.orderItems.some((item: any) => item.id === menuItemId)
        );
      }
    } catch (error) {
      console.error('Error checking menu item usage:', error);
    }
    
    // Fallback: check in current session data
    // This would typically query the order database
    return false;
  }

  // Categories CRUD
  public getAllCategories(): Category[] {
    return [...this.categories];
  }

  public getCategoryById(id: string): Category | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  public createCategory(name: string, description?: string): Category {
    const newCategory: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
    };
    
    this.categories.push(newCategory);
    this.saveCategoriesToStorage();
    return newCategory;
  }

  public updateCategory(id: string, name: string, description?: string): Category | null {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) return null;
    
    this.categories[index] = {
      ...this.categories[index],
      name,
      description,
    };
    
    this.saveCategoriesToStorage();
    return this.categories[index];
  }

  public deleteCategory(id: string): boolean {
    // Check if category is used by any menu items
    const isUsed = this.menuItems.some(item => item.categoryId === id);
    if (isUsed) {
      throw new Error('Không thể xóa danh mục đang được sử dụng bởi các món ăn');
    }
    
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) return false;
    
    this.categories.splice(index, 1);
    this.saveCategoriesToStorage();
    return true;
  }

  // Search functionality
  public searchMenuItems(query: string): MenuItem[] {
    const lowerQuery = query.toLowerCase();
    return this.menuItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerQuery))
    );
  }

  // Reset to default data
  public resetToDefault(): void {
    this.initializeDefaultMenu();
    this.categories = [...DEFAULT_CATEGORIES];
    this.saveCategoriesToStorage();
  }
}

export default MenuService; 