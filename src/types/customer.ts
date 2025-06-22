export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  customerCode: string; // Mã khách hàng tự động
  totalSpent: number; // Tổng tiền đã chi
  visitCount: number; // Số lần đến
  firstVisit: string; // Lần đầu đến
  lastVisit: string; // Lần cuối đến
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CustomerOrder {
  id: string;
  customerId: string;
  tableId: string;
  tableCode: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'qr';
  paymentStatus: 'completed' | 'pending' | 'failed';
  orderItems: CustomerOrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CustomerOrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  category: string;
  images?: string[];
  notes?: string;
}

export interface CustomerSearchFilters {
  searchTerm: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: 'cash' | 'card' | 'qr' | 'all';
  minAmount?: number;
  maxAmount?: number;
}

export interface CustomerStatistics {
  totalCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCustomers: Customer[];
  recentOrders: CustomerOrder[];
} 