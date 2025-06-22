import type { Customer, CustomerOrder, CustomerOrderItem, CustomerSearchFilters, CustomerStatistics } from '../types/customer';

class CustomerService {
  private static instance: CustomerService;
  private customers: Customer[] = [];
  private orders: CustomerOrder[] = [];
  private listeners: (() => void)[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService();
    }
    return CustomerService.instance;
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
      const storedCustomers = localStorage.getItem('restaurant-customers');
      const storedOrders = localStorage.getItem('restaurant-customer-orders');
      
      if (storedCustomers) {
        this.customers = JSON.parse(storedCustomers);
      }
      
      if (storedOrders) {
        this.orders = JSON.parse(storedOrders);
      }
    } catch (error) {
      console.error('Error loading customer data from storage:', error);
      this.customers = [];
      this.orders = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('restaurant-customers', JSON.stringify(this.customers));
      localStorage.setItem('restaurant-customer-orders', JSON.stringify(this.orders));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving customer data to storage:', error);
    }
  }

  // Generate customer code
  private generateCustomerCode(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `KH${timestamp}${random}`;
  }

  // Customer Management
  public getAllCustomers(): Customer[] {
    return this.customers.sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.customers.find(customer => customer.id === id);
  }

  public getCustomerByPhone(phone: string): Customer | undefined {
    return this.customers.find(customer => customer.phone === phone);
  }

  public createCustomer(name: string, phone: string, email?: string): Customer {
    const existingCustomer = this.getCustomerByPhone(phone);
    if (existingCustomer) {
      return existingCustomer;
    }

    const now = new Date().toISOString();
    const customer: Customer = {
      id: `customer-${Date.now()}`,
      name,
      phone,
      email,
      customerCode: this.generateCustomerCode(),
      totalSpent: 0,
      visitCount: 0,
      firstVisit: now,
      lastVisit: now,
      createdAt: now,
      updatedAt: now,
      updatedBy: 'system'
    };

    this.customers.push(customer);
    this.saveToStorage();
    return customer;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const index = this.customers.findIndex(customer => customer.id === id);
    if (index === -1) return null;

    this.customers[index] = {
      ...this.customers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    };

    this.saveToStorage();
    return this.customers[index];
  }

  // Order Management
  public createOrder(
    customerId: string,
    tableId: string,
    tableCode: string,
    orderItems: any[],
    totalAmount: number,
    paymentMethod: 'cash' | 'card' | 'qr',
    notes?: string
  ): CustomerOrder {
    const now = new Date().toISOString();
    const orderId = `order-${Date.now()}`;

    const order: CustomerOrder = {
      id: orderId,
      customerId,
      tableId,
      tableCode,
      orderDate: now,
      totalAmount,
      paymentMethod,
      paymentStatus: 'completed',
      orderItems: orderItems.map((item, index) => ({
        id: `${orderId}-item-${index}`,
        orderId,
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        category: item.category,
        images: item.images || [],
        notes: item.notes
      })),
      notes,
      createdAt: now,
      updatedAt: now,
      updatedBy: 'system'
    };

    this.orders.push(order);

    // Update customer statistics
    this.updateCustomerStatistics(customerId, totalAmount);

    this.saveToStorage();
    return order;
  }

  private updateCustomerStatistics(customerId: string, orderAmount: number): void {
    const customer = this.getCustomerById(customerId);
    if (!customer) return;

    const now = new Date().toISOString();
    this.updateCustomer(customerId, {
      totalSpent: customer.totalSpent + orderAmount,
      visitCount: customer.visitCount + 1,
      lastVisit: now
    });
  }

  public getCustomerOrders(customerId: string): CustomerOrder[] {
    return this.orders
      .filter(order => order.customerId === customerId)
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  public getOrderById(orderId: string): CustomerOrder | undefined {
    return this.orders.find(order => order.id === orderId);
  }

  // Search and Filter
  public searchCustomers(filters: CustomerSearchFilters): Customer[] {
    let results = this.customers;

    // Search by term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.phone.includes(term) ||
        customer.customerCode.toLowerCase().includes(term) ||
        (customer.email && customer.email.toLowerCase().includes(term))
      );
    }

    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      results = results.filter(customer => {
        const lastVisit = new Date(customer.lastVisit);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

        if (fromDate && lastVisit < fromDate) return false;
        if (toDate && lastVisit > toDate) return false;
        return true;
      });
    }

    // Filter by amount range
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      results = results.filter(customer => {
        if (filters.minAmount !== undefined && customer.totalSpent < filters.minAmount) return false;
        if (filters.maxAmount !== undefined && customer.totalSpent > filters.maxAmount) return false;
        return true;
      });
    }

    return results;
  }

  public getCustomerOrdersByDateRange(customerId: string, dateFrom?: string, dateTo?: string): CustomerOrder[] {
    let orders = this.getCustomerOrders(customerId);

    if (dateFrom || dateTo) {
      orders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;

        if (fromDate && orderDate < fromDate) return false;
        if (toDate && orderDate > toDate) return false;
        return true;
      });
    }

    return orders;
  }

  // Statistics
  public getStatistics(): CustomerStatistics {
    const totalCustomers = this.customers.length;
    const totalRevenue = this.customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const averageOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    const topCustomers = [...this.customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    const recentOrders = [...this.orders]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 10);

    return {
      totalCustomers,
      totalRevenue,
      averageOrderValue,
      topCustomers,
      recentOrders
    };
  }

  // Migration from existing booking data
  public migrateFromBookings(bookings: any[]): void {
    bookings.forEach(booking => {
      if (booking.customerName && booking.phoneNumber) {
        this.createCustomer(booking.customerName, booking.phoneNumber);
      }
    });
  }

  // Export data for backup
  public exportData(): { customers: Customer[], orders: CustomerOrder[] } {
    return {
      customers: this.customers,
      orders: this.orders
    };
  }

  // Import data from backup
  public importData(data: { customers: Customer[], orders: CustomerOrder[] }): void {
    this.customers = data.customers;
    this.orders = data.orders;
    this.saveToStorage();
  }

  // Create sample data for testing
  public createSampleData(): void {
    // Sample customers
    const sampleCustomers: Customer[] = [
      {
        id: 'customer-1',
        name: 'Nguyễn Văn An',
        phone: '0123456789',
        email: 'nguyenvanan@email.com',
        customerCode: 'KH001234',
        totalSpent: 1250000,
        visitCount: 8,
        firstVisit: '2024-01-15T10:30:00Z',
        lastVisit: '2024-03-18T19:00:00Z',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-03-18T19:00:00Z',
        updatedBy: 'system'
      },
      {
        id: 'customer-2',
        name: 'Trần Thị Bình',
        phone: '0987654321',
        email: 'tranthibinh@email.com',
        customerCode: 'KH002345',
        totalSpent: 890000,
        visitCount: 5,
        firstVisit: '2024-02-01T12:00:00Z',
        lastVisit: '2024-03-20T18:30:00Z',
        createdAt: '2024-02-01T12:00:00Z',
        updatedAt: '2024-03-20T18:30:00Z',
        updatedBy: 'system'
      },
      {
        id: 'customer-3',
        name: 'Lê Văn Cường',
        phone: '0909123456',
        customerCode: 'KH003456',
        totalSpent: 2100000,
        visitCount: 12,
        firstVisit: '2024-01-10T11:15:00Z',
        lastVisit: '2024-03-19T20:15:00Z',
        createdAt: '2024-01-10T11:15:00Z',
        updatedAt: '2024-03-19T20:15:00Z',
        updatedBy: 'system'
      }
    ];

    // Sample orders
    const sampleOrders: CustomerOrder[] = [
      {
        id: 'order-1',
        customerId: 'customer-1',
        tableId: '101',
        tableCode: 'T1-01',
        orderDate: '2024-03-18T19:00:00Z',
        totalAmount: 180000,
        paymentMethod: 'cash',
        paymentStatus: 'completed',
        orderItems: [
          {
            id: 'order-1-item-1',
            orderId: 'order-1',
            menuItemId: 'menu-1',
            name: 'Phở bò',
            quantity: 2,
            price: 50000,
            totalPrice: 100000,
            category: 'Món chính',
            images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400']
          },
          {
            id: 'order-1-item-2',
            orderId: 'order-1',
            menuItemId: 'menu-2',
            name: 'Nước ngọt',
            quantity: 2,
            price: 15000,
            totalPrice: 30000,
            category: 'Đồ uống',
            images: ['https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400']
          },
          {
            id: 'order-1-item-3',
            orderId: 'order-1',
            menuItemId: 'menu-3',
            name: 'Chè ba màu',
            quantity: 1,
            price: 25000,
            totalPrice: 25000,
            category: 'Tráng miệng',
            images: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400']
          }
        ],
        notes: 'Khách VIP - Ưu tiên phục vụ',
        createdAt: '2024-03-18T19:00:00Z',
        updatedAt: '2024-03-18T19:00:00Z',
        updatedBy: 'system'
      },
      {
        id: 'order-2',
        customerId: 'customer-2',
        tableId: '202',
        tableCode: 'T2-02',
        orderDate: '2024-03-20T18:30:00Z',
        totalAmount: 320000,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        orderItems: [
          {
            id: 'order-2-item-1',
            orderId: 'order-2',
            menuItemId: 'menu-4',
            name: 'Bún bò Huế',
            quantity: 3,
            price: 45000,
            totalPrice: 135000,
            category: 'Món chính',
            images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400']
          },
          {
            id: 'order-2-item-2',
            orderId: 'order-2',
            menuItemId: 'menu-5',
            name: 'Bia Tiger',
            quantity: 4,
            price: 20000,
            totalPrice: 80000,
            category: 'Đồ uống',
            images: ['https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400']
          },
          {
            id: 'order-2-item-3',
            orderId: 'order-2',
            menuItemId: 'menu-6',
            name: 'Gỏi cuốn',
            quantity: 2,
            price: 35000,
            totalPrice: 70000,
            category: 'Khai vị',
            images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400']
          }
        ],
        notes: 'Tiệc sinh nhật',
        createdAt: '2024-03-20T18:30:00Z',
        updatedAt: '2024-03-20T18:30:00Z',
        updatedBy: 'system'
      },
      {
        id: 'order-3',
        customerId: 'customer-3',
        tableId: '301',
        tableCode: 'T3-01',
        orderDate: '2024-03-19T20:15:00Z',
        totalAmount: 850000,
        paymentMethod: 'qr',
        paymentStatus: 'completed',
        orderItems: [
          {
            id: 'order-3-item-1',
            orderId: 'order-3',
            menuItemId: 'menu-7',
            name: 'Lẩu thái',
            quantity: 1,
            price: 350000,
            totalPrice: 350000,
            category: 'Món chính',
            images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400']
          },
          {
            id: 'order-3-item-2',
            orderId: 'order-3',
            menuItemId: 'menu-8',
            name: 'Rượu vang đỏ',
            quantity: 1,
            price: 500000,
            totalPrice: 500000,
            category: 'Đồ uống',
            images: ['https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400']
          }
        ],
        notes: 'Khách VIP - Phòng riêng',
        createdAt: '2024-03-19T20:15:00Z',
        updatedAt: '2024-03-19T20:15:00Z',
        updatedBy: 'system'
      }
    ];

    this.customers = sampleCustomers;
    this.orders = sampleOrders;
    this.saveToStorage();
  }
}

export default CustomerService; 