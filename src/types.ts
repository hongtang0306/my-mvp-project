export type TableStatus = 'available' | 'occupied' | 'reserved';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type MenuItemStatus = 'available' | 'out_of_stock';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Table {
  id: string;
  name: string;
  zone: string;
  seats: number;
  status: TableStatus;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  status: MenuItemStatus;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Menu {
  categories: MenuCategory[];
}

export interface Reservation {
  id: string;
  tableId: string;
  customerName: string;
  phoneNumber: string;
  numberOfGuests: number;
  reservationTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;
} 