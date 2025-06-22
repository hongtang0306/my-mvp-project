export type TableStatus = 'Trống sạch' | 'Đã Đặt' | 'Đang phục vụ' | 'Bàn dơ' | 'Bảo trì' | 'Tạm ngưng';

export interface Customer {
  name: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  notes?: string;
  images?: string[];
}

export interface Booking {
  customerName: string;
  phoneNumber: string;
  reservationTime: string;
  numberOfGuests: number;
  specialNotes?: string;
}

export interface BookingFormData {
  customerName: string;
  phoneNumber: string;
  reservationTime: string;
  numberOfGuests: number;
  specialNotes?: string;
}

// Enhanced Table interface for configuration management
export interface Table {
  id: string;
  code: string;
  zone: string;
  seats: number;
  status: TableStatus;
  booking?: BookingFormData;
  orderItems?: OrderItem[];
  // New fields for configuration management
  floorId?: string;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive?: boolean;
}

// New interfaces for table configuration
export interface Floor {
  id: string;
  name: string;
  description?: string;
  maxTables: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface TableCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface TableConfig {
  id: string;
  tableId: string;
  floorId: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PaymentDetails {
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'qr';
  paymentStatus: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export interface TableHistory {
  tableId: string;
  action: 'booking' | 'status_change' | 'payment' | 'create' | 'update' | 'delete';
  timestamp: string;
  details: Booking | TableStatus | PaymentDetails | string;
  updatedBy?: string;
}

export interface TableTransfer {
  id: string;
  sourceTableId: string;
  sourceTableCode: string;
  targetTableId: string;
  targetTableCode: string;
  reason: string;
  transferredBy: string;
  transferredAt: string;
  sourceTableStatus: TableStatus;
  targetTableStatus: TableStatus;
  sourceFloorId?: string;
  sourceFloorName?: string;
  targetFloorId?: string;
  targetFloorName?: string;
  // Additional info for tracking
  customerName?: string;
  numberOfGuests?: number;
  orderItems?: OrderItem[];
}

export interface CreateTableTransferData {
  sourceTableId: string;
  targetTableId: string;
  reason: string;
  transferredBy: string;
} 