import type { TableTransfer, CreateTableTransferData, Table, TableStatus } from '../types/table';

class TableTransferService {
  private static instance: TableTransferService;
  private transfers: TableTransfer[] = [];
  private listeners: (() => void)[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): TableTransferService {
    if (!TableTransferService.instance) {
      TableTransferService.instance = new TableTransferService();
    }
    return TableTransferService.instance;
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
      const storedTransfers = localStorage.getItem('restaurant-table-transfers');
      if (storedTransfers) {
        this.transfers = JSON.parse(storedTransfers);
      }
    } catch (error) {
      console.error('Error loading table transfers from storage:', error);
      this.transfers = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('restaurant-table-transfers', JSON.stringify(this.transfers));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving table transfers to storage:', error);
    }
  }

  // Get all transfers
  public getAllTransfers(): TableTransfer[] {
    return [...this.transfers].sort((a, b) => 
      new Date(b.transferredAt).getTime() - new Date(a.transferredAt).getTime()
    );
  }

  // Get transfers by date range
  public getTransfersByDateRange(startDate: Date, endDate: Date): TableTransfer[] {
    return this.transfers.filter(transfer => {
      const transferDate = new Date(transfer.transferredAt);
      return transferDate >= startDate && transferDate <= endDate;
    });
  }

  // Get transfers by floor
  public getTransfersByFloor(floorId: string): TableTransfer[] {
    return this.transfers.filter(transfer => 
      transfer.sourceFloorId === floorId || transfer.targetFloorId === floorId
    );
  }

  // Get transfers by table
  public getTransfersByTable(tableId: string): TableTransfer[] {
    return this.transfers.filter(transfer => 
      transfer.sourceTableId === tableId || transfer.targetTableId === tableId
    );
  }

  // Create a new transfer
  public createTransfer(data: CreateTableTransferData, sourceTable: Table, targetTable: Table): TableTransfer {
    const transfer: TableTransfer = {
      id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceTableId: data.sourceTableId,
      sourceTableCode: sourceTable.code,
      targetTableId: data.targetTableId,
      targetTableCode: targetTable.code,
      reason: data.reason,
      transferredBy: data.transferredBy,
      transferredAt: new Date().toISOString(),
      sourceTableStatus: sourceTable.status,
      targetTableStatus: targetTable.status,
      sourceFloorId: sourceTable.floorId,
      sourceFloorName: sourceTable.zone,
      targetFloorId: targetTable.floorId,
      targetFloorName: targetTable.zone,
      customerName: sourceTable.booking?.customerName,
      numberOfGuests: sourceTable.booking?.numberOfGuests,
      orderItems: sourceTable.orderItems,
    };

    this.transfers.push(transfer);
    this.saveToStorage();
    return transfer;
  }

  // Validate if transfer is possible
  public validateTransfer(sourceTable: Table, targetTable: Table): { isValid: boolean; error?: string } {
    // Check if source table can be transferred
    if (sourceTable.status !== 'Đã Đặt' && sourceTable.status !== 'Đang phục vụ') {
      return { 
        isValid: false, 
        error: 'Chỉ có thể chuyển bàn đã đặt hoặc đang phục vụ' 
      };
    }

    // Check if target table is available
    if (targetTable.status !== 'Trống sạch') {
      return { 
        isValid: false, 
        error: 'Bàn đích phải trống và sạch' 
      };
    }

    // Check if target table has enough seats
    if (targetTable.seats < sourceTable.seats) {
      return { 
        isValid: false, 
        error: `Bàn đích phải có ít nhất ${sourceTable.seats} chỗ ngồi` 
      };
    }

    // Check if target table is not the same as source table
    if (sourceTable.id === targetTable.id) {
      return { 
        isValid: false, 
        error: 'Không thể chuyển bàn đến chính nó' 
      };
    }

    return { isValid: true };
  }

  // Get available tables for transfer (excluding source table)
  public getAvailableTablesForTransfer(sourceTable: Table, allTables: Table[]): Table[] {
    return allTables.filter(table => {
      // Must be different from source table
      if (table.id === sourceTable.id) return false;
      
      // Must be available (Trống sạch)
      if (table.status !== 'Trống sạch') return false;
      
      // Must have enough seats
      if (table.seats < sourceTable.seats) return false;
      
      return true;
    });
  }

  // Delete transfer (for admin purposes)
  public deleteTransfer(transferId: string): boolean {
    const index = this.transfers.findIndex(transfer => transfer.id === transferId);
    if (index === -1) return false;
    
    this.transfers.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Clear old transfers (for maintenance)
  public clearOldTransfers(olderThanDays: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const initialCount = this.transfers.length;
    this.transfers = this.transfers.filter(transfer => 
      new Date(transfer.transferredAt) > cutoffDate
    );
    
    const deletedCount = initialCount - this.transfers.length;
    if (deletedCount > 0) {
      this.saveToStorage();
    }
    
    return deletedCount;
  }
}

export default TableTransferService; 