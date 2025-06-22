// Table types
export type TableStatus = 'available' | 'reserved' | 'serving' | 'billing' | 'done';

export interface Table {
  id: string;
  seats: number;
  status: TableStatus;
}

export interface Zone {
  id: number;
  name: string;
  tables: Table[];
}

// Menu types
export type MenuItemStatus = 'available' | 'out_of_stock';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  status: MenuItemStatus;
}

export interface MenuCategory {
  id: number;
  name: string;
  items: MenuItem[];
}

// Order types
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes: string;
}

export type OrderStatus = 'preparing' | 'served' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
}

// Reservation types
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reservation {
  id: string;
  customerName: string;
  phoneNumber: string;
  tableId: string;
  numberOfGuests: number;
  reservationTime: string;
  specialNotes: string;
  status: ReservationStatus;
} 