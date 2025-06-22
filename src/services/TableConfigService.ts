import type { Table, Floor, TableCategory, TableConfig, TableHistory } from '../types/table';

class TableConfigService {
  private static instance: TableConfigService;
  private floors: Floor[] = [];
  private categories: TableCategory[] = [];
  private tableConfigs: TableConfig[] = [];
  private tableHistory: TableHistory[] = [];

  private constructor() {
    this.loadData();
  }

  public static getInstance(): TableConfigService {
    if (!TableConfigService.instance) {
      TableConfigService.instance = new TableConfigService();
    }
    return TableConfigService.instance;
  }

  private loadData(): void {
    // Load floors
    const storedFloors = localStorage.getItem('restaurant-floors');
    if (storedFloors) {
      this.floors = JSON.parse(storedFloors);
    } else {
      // Initialize with default floors
      this.floors = [
        {
          id: 'floor-1',
          name: 'Tầng 1',
          description: 'Tầng trệt',
          maxTables: 10,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        },
        {
          id: 'floor-2',
          name: 'Tầng 2',
          description: 'Tầng lầu',
          maxTables: 10,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        },
        {
          id: 'floor-3',
          name: 'Tầng 3 - VIP',
          description: 'Tầng VIP',
          maxTables: 10,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
      ];
      this.saveFloors();
    }

    // Load categories
    const storedCategories = localStorage.getItem('restaurant-table-categories');
    if (storedCategories) {
      this.categories = JSON.parse(storedCategories);
    } else {
      // Initialize with default categories
      this.categories = [
        {
          id: 'cat-normal',
          name: 'Bàn thường',
          description: 'Bàn phục vụ thường',
          color: '#3B82F6',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        },
        {
          id: 'cat-vip',
          name: 'Bàn VIP',
          description: 'Bàn phục vụ VIP',
          color: '#F59E0B',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
      ];
      this.saveCategories();
    }

    // Load table configs
    const storedConfigs = localStorage.getItem('restaurant-table-configs');
    if (storedConfigs) {
      this.tableConfigs = JSON.parse(storedConfigs);
    }

    // Load history
    const storedHistory = localStorage.getItem('restaurant-table-history');
    if (storedHistory) {
      this.tableHistory = JSON.parse(storedHistory);
    }
  }

  private saveFloors(): void {
    localStorage.setItem('restaurant-floors', JSON.stringify(this.floors));
  }

  private saveCategories(): void {
    localStorage.setItem('restaurant-table-categories', JSON.stringify(this.categories));
  }

  private saveConfigs(): void {
    localStorage.setItem('restaurant-table-configs', JSON.stringify(this.tableConfigs));
  }

  private saveHistory(): void {
    localStorage.setItem('restaurant-table-history', JSON.stringify(this.tableHistory));
  }

  private addHistory(action: TableHistory['action'], tableId: string, details: any, updatedBy: string = 'system'): void {
    const history: TableHistory = {
      tableId,
      action,
      timestamp: new Date().toISOString(),
      details,
      updatedBy
    };
    this.tableHistory.push(history);
    this.saveHistory();
  }

  // Floor Management
  public getFloors(): Floor[] {
    return this.floors.filter(floor => floor.isActive);
  }

  public getFloorById(id: string): Floor | undefined {
    return this.floors.find(floor => floor.id === id);
  }

  public createFloor(floor: Omit<Floor, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>, updatedBy: string = 'system'): Floor {
    const newFloor: Floor = {
      ...floor,
      id: `floor-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    this.floors.push(newFloor);
    this.saveFloors();
    return newFloor;
  }

  public updateFloor(id: string, updates: Partial<Floor>, updatedBy: string = 'system'): Floor | null {
    const index = this.floors.findIndex(floor => floor.id === id);
    if (index === -1) return null;

    this.floors[index] = {
      ...this.floors[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    this.saveFloors();
    return this.floors[index];
  }

  public deleteFloor(id: string, updatedBy: string = 'system'): boolean {
    const index = this.floors.findIndex(floor => floor.id === id);
    if (index === -1) return false;

    // Check if floor has tables
    const hasTables = this.tableConfigs.some(config => config.floorId === id && config.isActive);
    if (hasTables) {
      throw new Error('Không thể xóa tầng đang có bàn được cấu hình');
    }

    this.floors[index].isActive = false;
    this.floors[index].updatedAt = new Date().toISOString();
    this.floors[index].updatedBy = updatedBy;
    this.saveFloors();
    return true;
  }

  // Category Management
  public getCategories(): TableCategory[] {
    return this.categories.filter(category => category.isActive);
  }

  public getCategoryById(id: string): TableCategory | undefined {
    return this.categories.find(category => category.id === id);
  }

  public createCategory(category: Omit<TableCategory, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>, updatedBy: string = 'system'): TableCategory {
    const newCategory: TableCategory = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    this.categories.push(newCategory);
    this.saveCategories();
    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<TableCategory>, updatedBy: string = 'system'): TableCategory | null {
    const index = this.categories.findIndex(category => category.id === id);
    if (index === -1) return null;

    this.categories[index] = {
      ...this.categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    this.saveCategories();
    return this.categories[index];
  }

  public deleteCategory(id: string, updatedBy: string = 'system'): boolean {
    const index = this.categories.findIndex(category => category.id === id);
    if (index === -1) return false;

    // Check if category has tables
    const hasTables = this.tableConfigs.some(config => config.categoryId === id && config.isActive);
    if (hasTables) {
      throw new Error('Không thể xóa danh mục đang có bàn được cấu hình');
    }

    this.categories[index].isActive = false;
    this.categories[index].updatedAt = new Date().toISOString();
    this.categories[index].updatedBy = updatedBy;
    this.saveCategories();
    return true;
  }

  // Table Configuration Management
  public getTableConfigs(): TableConfig[] {
    return this.tableConfigs.filter(config => config.isActive);
  }

  public getTableConfigByTableId(tableId: string): TableConfig | undefined {
    return this.tableConfigs.find(config => config.tableId === tableId && config.isActive);
  }

  public createTableConfig(config: Omit<TableConfig, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>, updatedBy: string = 'system'): TableConfig {
    // Validate floor capacity
    const floor = this.getFloorById(config.floorId);
    if (!floor) {
      throw new Error('Tầng không tồn tại');
    }

    const floorTables = this.tableConfigs.filter(c => c.floorId === config.floorId && c.isActive);
    if (floorTables.length >= floor.maxTables) {
      throw new Error(`Tầng ${floor.name} đã đạt giới hạn tối đa ${floor.maxTables} bàn`);
    }

    const newConfig: TableConfig = {
      ...config,
      id: `config-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    this.tableConfigs.push(newConfig);
    this.saveConfigs();
    this.addHistory('create', config.tableId, `Tạo cấu hình bàn`, updatedBy);
    return newConfig;
  }

  public updateTableConfig(id: string, updates: Partial<TableConfig>, updatedBy: string = 'system'): TableConfig | null {
    const index = this.tableConfigs.findIndex(config => config.id === id);
    if (index === -1) return null;

    // Validate floor capacity if changing floor
    if (updates.floorId && updates.floorId !== this.tableConfigs[index].floorId) {
      const floor = this.getFloorById(updates.floorId);
      if (!floor) {
        throw new Error('Tầng không tồn tại');
      }

      const floorTables = this.tableConfigs.filter(c => c.floorId === updates.floorId && c.isActive && c.id !== id);
      if (floorTables.length >= floor.maxTables) {
        throw new Error(`Tầng ${floor.name} đã đạt giới hạn tối đa ${floor.maxTables} bàn`);
      }
    }

    this.tableConfigs[index] = {
      ...this.tableConfigs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    this.saveConfigs();
    this.addHistory('update', this.tableConfigs[index].tableId, `Cập nhật cấu hình bàn`, updatedBy);
    return this.tableConfigs[index];
  }

  public deleteTableConfig(id: string, updatedBy: string = 'system'): boolean {
    const index = this.tableConfigs.findIndex(config => config.id === id);
    if (index === -1) return false;

    const tableId = this.tableConfigs[index].tableId;
    
    // Check if table is in use
    const storedTables = localStorage.getItem('restaurant-tables');
    if (storedTables) {
      const tables: Table[] = JSON.parse(storedTables);
      const table = tables.find(t => t.id === tableId);
      if (table && table.status !== 'Trống sạch') {
        throw new Error('Không thể xóa cấu hình bàn đang được sử dụng');
      }
    }

    this.tableConfigs[index].isActive = false;
    this.tableConfigs[index].updatedAt = new Date().toISOString();
    this.tableConfigs[index].updatedBy = updatedBy;
    this.saveConfigs();
    this.addHistory('delete', tableId, `Xóa cấu hình bàn`, updatedBy);
    return true;
  }

  // Get table history
  public getTableHistory(tableId?: string): TableHistory[] {
    if (tableId) {
      return this.tableHistory.filter(history => history.tableId === tableId);
    }
    return this.tableHistory;
  }

  // Sync with existing table data
  public syncWithExistingTables(): void {
    const storedTables = localStorage.getItem('restaurant-tables');
    if (!storedTables) return;

    const tables: Table[] = JSON.parse(storedTables);
    
    // Update existing tables with new fields
    const updatedTables = tables.map(table => ({
      ...table,
      floorId: table.floorId || this.getDefaultFloorId(table.zone),
      categoryId: table.categoryId || this.getDefaultCategoryId(table.zone),
      createdAt: table.createdAt || new Date().toISOString(),
      updatedAt: table.updatedAt || new Date().toISOString(),
      updatedBy: table.updatedBy || 'system',
      isActive: table.isActive !== false
    }));

    localStorage.setItem('restaurant-tables', JSON.stringify(updatedTables));
    
    // Create table configs for existing tables if they don't exist
    updatedTables.forEach(table => {
      const existingConfig = this.tableConfigs.find(config => config.tableId === table.id);
      if (!existingConfig) {
        this.createTableConfig({
          tableId: table.id,
          floorId: table.floorId!,
          categoryId: table.categoryId!,
          isActive: true
        }, 'system');
      }
    });
  }

  // Enhanced sync method for new tables
  public syncNewTable(table: Table): void {
    // Update table with new fields if needed
    const updatedTable = {
      ...table,
      floorId: table.floorId || this.getDefaultFloorId(table.zone),
      categoryId: table.categoryId || this.getDefaultCategoryId(table.zone),
      createdAt: table.createdAt || new Date().toISOString(),
      updatedAt: table.updatedAt || new Date().toISOString(),
      updatedBy: table.updatedBy || 'system',
      isActive: table.isActive !== false
    };

    // Update localStorage
    const storedTables = localStorage.getItem('restaurant-tables');
    if (storedTables) {
      const tables: Table[] = JSON.parse(storedTables);
      const existingIndex = tables.findIndex(t => t.id === table.id);
      
      if (existingIndex >= 0) {
        tables[existingIndex] = updatedTable;
      } else {
        tables.push(updatedTable);
      }
      
      localStorage.setItem('restaurant-tables', JSON.stringify(tables));
    }

    // Create table config
    const existingConfig = this.tableConfigs.find(config => config.tableId === table.id);
    if (!existingConfig) {
      this.createTableConfig({
        tableId: table.id,
        floorId: updatedTable.floorId!,
        categoryId: updatedTable.categoryId!,
        isActive: true
      }, 'system');
    }
  }

  // Sync table status changes
  public syncTableStatus(tableId: string, newStatus: string): void {
    const storedTables = localStorage.getItem('restaurant-tables');
    if (!storedTables) return;

    const tables: Table[] = JSON.parse(storedTables);
    const tableIndex = tables.findIndex(t => t.id === tableId);
    
    if (tableIndex >= 0) {
      tables[tableIndex] = {
        ...tables[tableIndex],
        status: newStatus as any,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      };
      
      localStorage.setItem('restaurant-tables', JSON.stringify(tables));
    }
  }

  // Get tables by floor
  public getTablesByFloor(floorId: string): Table[] {
    const storedTables = localStorage.getItem('restaurant-tables');
    if (!storedTables) return [];

    const tables: Table[] = JSON.parse(storedTables);
    return tables.filter(table => table.floorId === floorId);
  }

  // Get tables by status
  public getTablesByStatus(status: string): Table[] {
    const storedTables = localStorage.getItem('restaurant-tables');
    if (!storedTables) return [];

    const tables: Table[] = JSON.parse(storedTables);
    return tables.filter(table => table.status === status);
  }

  // Get tables by category
  public getTablesByCategory(categoryId: string): Table[] {
    const storedTables = localStorage.getItem('restaurant-tables');
    if (!storedTables) return [];

    const tables: Table[] = JSON.parse(storedTables);
    return tables.filter(table => table.categoryId === categoryId);
  }

  private getDefaultFloorId(zone: string): string {
    if (zone.includes('Tầng 1')) return 'floor-1';
    if (zone.includes('Tầng 2')) return 'floor-2';
    if (zone.includes('Tầng 3')) return 'floor-3';
    return 'floor-1';
  }

  private getDefaultCategoryId(zone: string): string {
    if (zone.includes('VIP')) return 'cat-vip';
    return 'cat-normal';
  }
}

export default TableConfigService; 