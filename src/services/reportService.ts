import type { PaymentDetails, OrderItem, Table, BookingFormData } from '../types/table';

export interface PaymentHistory extends PaymentDetails {
  tableCode: string;
  orderItems: OrderItem[];
  bookingInfo?: BookingFormData;
  startTime?: string;
  endTime: string;
}

export interface TableAnalytics {
  totalCustomers: number;
  averageDiningTime: number; // in minutes
  overbookingRate: number;
  popularDishes: Array<{
    name: string;
    quantity: number;
    revenue: number;
    category: string;
  }>;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
}

// New interfaces for extended analytics
export interface PopularDishesAnalytics {
  dishes: Array<{
    name: string;
    quantity: number;
    revenue: number;
    category: string;
  }>;
  totalRevenue: number;
  totalOrders: number;
}

export interface CustomerAnalytics {
  dailyCustomers: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  totalCustomers: number;
  averageCustomersPerDay: number;
}

export interface PaymentMethodAnalytics {
  methods: Array<{
    method: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  totalRevenue: number;
}

export interface RevenueByTimeAnalytics {
  hourlyRevenue: Array<{
    hour: number;
    revenue: number;
    orders: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  peakHour: number;
  peakRevenue: number;
}

export interface OrderAnalytics {
  dailyOrders: Array<{
    date: string;
    orders: number;
    revenue: number;
    averageOrderValue: number;
  }>;
  totalOrders: number;
  averageOrderValue: number;
}

export interface ProfitAnalytics {
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  dailyProfit: Array<{
    date: string;
    revenue: number;
    costs: number;
    profit: number;
  }>;
}

export interface TableZoneAnalytics {
  zones: Array<{
    zone: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }>;
  totalRevenue: number;
}

class ReportService {
  private static instance: ReportService;
  private paymentHistory: PaymentHistory[] = [];

  private constructor() {
    this.loadFromLocalStorage();
    this.initializeSampleData();
  }

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  public addPayment(
    table: Table,
    paymentDetails: PaymentDetails,
    startTime?: string
  ): void {
    if (!table.orderItems) return;

    const payment: PaymentHistory = {
      ...paymentDetails,
      tableCode: table.code,
      orderItems: [...table.orderItems],
      bookingInfo: table.booking,
      startTime: startTime || table.booking?.reservationTime,
      endTime: paymentDetails.timestamp
    };

    this.paymentHistory.push(payment);
    this.saveToLocalStorage();
  }

  public getPaymentHistory(): PaymentHistory[] {
    return this.paymentHistory;
  }

  public getAnalytics(startDate?: Date, endDate?: Date): TableAnalytics {
    const filteredHistory = this.filterByDateRange(startDate, endDate);

    // Calculate total customers
    const totalCustomers = filteredHistory.reduce((sum, payment) => 
      sum + (payment.bookingInfo?.numberOfGuests || 0), 0);

    // Calculate average dining time
    const diningTimes = filteredHistory
      .filter(payment => payment.startTime && payment.endTime)
      .map(payment => {
        const start = new Date(payment.startTime!);
        const end = new Date(payment.endTime);
        return (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
      });
    const averageDiningTime = diningTimes.length > 0
      ? diningTimes.reduce((sum, time) => sum + time, 0) / diningTimes.length
      : 0;

    // Calculate overbooking rate
    const totalBookings = filteredHistory.filter(payment => payment.bookingInfo).length;
    const overlappingBookings = this.calculateOverlappingBookings(filteredHistory);
    const overbookingRate = totalBookings > 0 ? overlappingBookings / totalBookings : 0;

    // Calculate popular dishes
    const dishStats = new Map<string, { quantity: number; revenue: number; category: string }>();
    filteredHistory.forEach(payment => {
      payment.orderItems.forEach(item => {
        const existing = dishStats.get(item.name) || { 
          quantity: 0, 
          revenue: 0,
          category: item.category
        };
        dishStats.set(item.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity),
          category: item.category
        });
      });
    });

    const popularDishes = Array.from(dishStats.entries())
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue,
        category: stats.category
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Calculate peak hours
    const hourCounts = new Array(24).fill(0);
    filteredHistory.forEach(payment => {
      const hour = new Date(payment.timestamp).getHours();
      hourCounts[hour]++;
    });

    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalCustomers,
      averageDiningTime,
      overbookingRate,
      popularDishes,
      peakHours
    };
  }

  // New analytics methods
  public getPopularDishesAnalytics(startDate?: Date, endDate?: Date): PopularDishesAnalytics {
    const filteredHistory = this.filterByDateRange(startDate, endDate);
    
    const dishStats = new Map<string, { quantity: number; revenue: number; category: string }>();
    filteredHistory.forEach(payment => {
      payment.orderItems.forEach(item => {
        const existing = dishStats.get(item.name) || { 
          quantity: 0, 
          revenue: 0,
          category: item.category
        };
        dishStats.set(item.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity),
          category: item.category
        });
      });
    });

    const dishes = Array.from(dishStats.entries())
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue,
        category: stats.category
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 15);

    const totalRevenue = dishes.reduce((sum, dish) => sum + dish.revenue, 0);
    const totalOrders = filteredHistory.length;

    return {
      dishes,
      totalRevenue,
      totalOrders
    };
  }

  public getCustomerAnalytics(startDate?: Date, endDate?: Date): CustomerAnalytics {
    const filteredHistory = this.filterByDateRange(startDate, endDate);
    
    const dailyStats = new Map<string, { count: number; revenue: number }>();
    filteredHistory.forEach(payment => {
      const date = new Date(payment.timestamp).toLocaleDateString('vi-VN');
      const existing = dailyStats.get(date) || { count: 0, revenue: 0 };
      dailyStats.set(date, {
        count: existing.count + (payment.bookingInfo?.numberOfGuests || 1),
        revenue: existing.revenue + payment.total
      });
    });

    const dailyCustomers = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        count: stats.count,
        revenue: stats.revenue
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalCustomers = dailyCustomers.reduce((sum, day) => sum + day.count, 0);
    const averageCustomersPerDay = dailyCustomers.length > 0 ? totalCustomers / dailyCustomers.length : 0;

    return {
      dailyCustomers,
      totalCustomers,
      averageCustomersPerDay
    };
  }

  public getPaymentMethodAnalytics(startDate?: Date, endDate?: Date): PaymentMethodAnalytics {
    const filteredHistory = this.filterByDateRange(startDate, endDate);
    
    const methodStats = new Map<string, { count: number; revenue: number }>();
    filteredHistory.forEach(payment => {
      const method = payment.paymentMethod === 'cash' ? 'Tiền mặt' : 
                    payment.paymentMethod === 'card' ? 'Thẻ' : 
                    payment.paymentMethod === 'qr' ? 'QR Code' : 'Khác';
      const existing = methodStats.get(method) || { count: 0, revenue: 0 };
      methodStats.set(method, {
        count: existing.count + 1,
        revenue: existing.revenue + payment.total
      });
    });

    const totalRevenue = filteredHistory.reduce((sum, payment) => sum + payment.total, 0);
    
    const methods = Array.from(methodStats.entries())
      .map(([method, stats]) => ({
        method,
        count: stats.count,
        revenue: stats.revenue,
        percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      methods,
      totalRevenue
    };
  }

  public getRevenueByTimeAnalytics(startDate?: Date, endDate?: Date): RevenueByTimeAnalytics {
    const filteredHistory = this.filterByDateRange(startDate, endDate);
    
    // Hourly revenue
    const hourlyStats = new Map<number, { revenue: number; orders: number }>();
    for (let i = 0; i < 24; i++) {
      hourlyStats.set(i, { revenue: 0, orders: 0 });
    }
    
    filteredHistory.forEach(payment => {
      const hour = new Date(payment.timestamp).getHours();
      const existing = hourlyStats.get(hour)!;
      hourlyStats.set(hour, {
        revenue: existing.revenue + payment.total,
        orders: existing.orders + 1
      });
    });

    const hourlyRevenue = Array.from(hourlyStats.entries())
      .map(([hour, stats]) => ({
        hour,
        revenue: stats.revenue,
        orders: stats.orders
      }))
      .sort((a, b) => a.hour - b.hour);

    // Daily revenue
    const dailyStats = new Map<string, { revenue: number; orders: number }>();
    filteredHistory.forEach(payment => {
      const date = new Date(payment.timestamp).toLocaleDateString('vi-VN');
      const existing = dailyStats.get(date) || { revenue: 0, orders: 0 };
      dailyStats.set(date, {
        revenue: existing.revenue + payment.total,
        orders: existing.orders + 1
      });
    });

    const dailyRevenue = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        revenue: stats.revenue,
        orders: stats.orders
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find peak hour
    const peakHourData = hourlyRevenue.reduce((max, current) => 
      current.revenue > max.revenue ? current : max, hourlyRevenue[0]);

    return {
      hourlyRevenue,
      dailyRevenue,
      peakHour: peakHourData?.hour || 0,
      peakRevenue: peakHourData?.revenue || 0
    };
  }

  public getOrderAnalytics(startDate?: Date, endDate?: Date): OrderAnalytics {
    const filteredHistory = this.filterByDateRange(startDate, endDate);
    
    const dailyStats = new Map<string, { orders: number; revenue: number }>();
    filteredHistory.forEach(payment => {
      const date = new Date(payment.timestamp).toLocaleDateString('vi-VN');
      const existing = dailyStats.get(date) || { orders: 0, revenue: 0 };
      dailyStats.set(date, {
        orders: existing.orders + 1,
        revenue: existing.revenue + payment.total
      });
    });

    const dailyOrders = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        orders: stats.orders,
        revenue: stats.revenue,
        averageOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalOrders = filteredHistory.length;
    const totalRevenue = filteredHistory.reduce((sum, payment) => sum + payment.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      dailyOrders,
      totalOrders,
      averageOrderValue
    };
  }

  public getProfitAnalytics(startDate?: Date, endDate?: Date): ProfitAnalytics {
    const filteredHistory = this.filterByDateRange(startDate, endDate);
    
    // Mock cost calculation (in real app, this would come from inventory/expense data)
    const revenue = filteredHistory.reduce((sum, payment) => sum + payment.total, 0);
    const costs = revenue * 0.6; // Assume 60% cost ratio
    const profit = revenue - costs;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Daily profit breakdown
    const dailyStats = new Map<string, { revenue: number; costs: number; profit: number }>();
    filteredHistory.forEach(payment => {
      const date = new Date(payment.timestamp).toLocaleDateString('vi-VN');
      const existing = dailyStats.get(date) || { revenue: 0, costs: 0, profit: 0 };
      const dayRevenue = existing.revenue + payment.total;
      const dayCosts = dayRevenue * 0.6;
      dailyStats.set(date, {
        revenue: dayRevenue,
        costs: dayCosts,
        profit: dayRevenue - dayCosts
      });
    });

    const dailyProfit = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        revenue: stats.revenue,
        costs: stats.costs,
        profit: stats.profit
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      revenue,
      costs,
      profit,
      profitMargin,
      dailyProfit
    };
  }

  public getTableZoneAnalytics(startDate?: Date, endDate?: Date): TableZoneAnalytics {
    const filteredHistory = this.filterByDateRange(startDate, endDate);
    
    const zoneStats = new Map<string, { revenue: number; orders: number }>();
    filteredHistory.forEach(payment => {
      const zone = this.getZoneFromTableCode(payment.tableCode);
      const existing = zoneStats.get(zone) || { revenue: 0, orders: 0 };
      zoneStats.set(zone, {
        revenue: existing.revenue + payment.total,
        orders: existing.orders + 1
      });
    });

    const zones = Array.from(zoneStats.entries())
      .map(([zone, stats]) => ({
        zone,
        revenue: stats.revenue,
        orders: stats.orders,
        averageOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = zones.reduce((sum, zone) => sum + zone.revenue, 0);

    return {
      zones,
      totalRevenue
    };
  }

  public async exportReport(startDate?: Date, endDate?: Date): Promise<Blob> {
    const filteredHistory = this.filterByDateRange(startDate, endDate);
    const analytics = this.getAnalytics(startDate, endDate);

    // Create CSV content
    const csvContent = [
      // Header
      ['Báo cáo doanh thu nhà hàng'],
      ['Từ ngày:', startDate?.toLocaleDateString() || 'Tất cả'],
      ['Đến ngày:', endDate?.toLocaleDateString() || 'Tất cả'],
      [''],
      ['Thống kê tổng quan'],
      ['Tổng số khách:', analytics.totalCustomers],
      ['Thời gian trung bình/bàn:', `${Math.round(analytics.averageDiningTime)} phút`],
      ['Tỷ lệ overbooking:', `${(analytics.overbookingRate * 100).toFixed(1)}%`],
      [''],
      ['Chi tiết giao dịch'],
      ['Thời gian', 'Mã bàn', 'Số khách', 'Món ăn', 'Tạm tính', 'VAT', 'Tổng cộng', 'Thanh toán'],
      ...filteredHistory.map(payment => [
        new Date(payment.timestamp).toLocaleString(),
        payment.tableCode,
        payment.bookingInfo?.numberOfGuests || '',
        payment.orderItems.map(item => `${item.name} x${item.quantity}`).join('; '),
        payment.subtotal,
        payment.tax,
        payment.total,
        payment.paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ'
      ]),
      [''],
      ['Top món ăn được yêu thích'],
      ['Tên món', 'Số lượng', 'Doanh thu'],
      ...analytics.popularDishes.map(dish => [
        dish.name,
        dish.quantity,
        dish.revenue
      ])
    ];

    // Convert to CSV string
    const csv = csvContent
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create Blob
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  private filterByDateRange(startDate?: Date, endDate?: Date): PaymentHistory[] {
    if (!startDate && !endDate) return this.paymentHistory;

    return this.paymentHistory.filter(payment => {
      const paymentDate = new Date(payment.timestamp);
      if (startDate && paymentDate < startDate) return false;
      if (endDate && paymentDate > endDate) return false;
      return true;
    });
  }

  private calculateOverlappingBookings(history: PaymentHistory[]): number {
    let overlaps = 0;
    const bookings = history
      .filter(payment => payment.startTime && payment.endTime)
      .map(payment => ({
        start: new Date(payment.startTime!),
        end: new Date(payment.endTime)
      }));

    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        if (
          (bookings[i].start <= bookings[j].end && bookings[i].end >= bookings[j].start) ||
          (bookings[j].start <= bookings[i].end && bookings[j].end >= bookings[i].start)
        ) {
          overlaps++;
        }
      }
    }

    return overlaps;
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('paymentHistory', JSON.stringify(this.paymentHistory));
  }

  private loadFromLocalStorage(): void {
    const saved = localStorage.getItem('paymentHistory');
    if (saved) {
      this.paymentHistory = JSON.parse(saved);
    }
  }

  private initializeSampleData(): void {
    // Only add sample data if no existing data
    if (this.paymentHistory.length === 0) {
      const samplePayments: PaymentHistory[] = [
        {
          tableCode: 'T1-02',
          subtotal: 130000,
          tax: 13000,
          total: 143000,
          paymentMethod: 'cash',
          paymentStatus: 'completed',
          timestamp: new Date('2024-03-20T18:30:00').toISOString(),
          orderItems: [
            { id: '1', name: 'Phở bò', quantity: 2, price: 50000, category: 'Món chính' },
            { id: '2', name: 'Nước ngọt', quantity: 2, price: 15000, category: 'Đồ uống' }
          ],
          bookingInfo: {
            customerName: 'Nguyễn Văn A',
            phoneNumber: '0123456789',
            reservationTime: '2024-03-20T18:00:00',
            numberOfGuests: 4
          },
          startTime: '2024-03-20T18:00:00',
          endTime: '2024-03-20T18:30:00'
        },
        {
          tableCode: 'T2-02',
          subtotal: 215000,
          tax: 21500,
          total: 236500,
          paymentMethod: 'card',
          paymentStatus: 'completed',
          timestamp: new Date('2024-03-20T19:15:00').toISOString(),
          orderItems: [
            { id: '3', name: 'Bún bò', quantity: 3, price: 45000, category: 'Món chính' },
            { id: '4', name: 'Bia', quantity: 4, price: 20000, category: 'Đồ uống' }
          ],
          bookingInfo: {
            customerName: 'Lê Văn C',
            phoneNumber: '0909123456',
            reservationTime: '2024-03-20T18:00:00',
            numberOfGuests: 5
          },
          startTime: '2024-03-20T18:00:00',
          endTime: '2024-03-20T19:15:00'
        },
        {
          tableCode: 'T3-02',
          subtotal: 850000,
          tax: 85000,
          total: 935000,
          paymentMethod: 'card',
          paymentStatus: 'completed',
          timestamp: new Date('2024-03-20T20:30:00').toISOString(),
          orderItems: [
            { id: '5', name: 'Lẩu thái', quantity: 1, price: 350000, category: 'Món chính' },
            { id: '6', name: 'Rượu vang', quantity: 1, price: 500000, category: 'Đồ uống' }
          ],
          bookingInfo: {
            customerName: 'Hoàng Văn E',
            phoneNumber: '0977888999',
            reservationTime: '2024-03-20T19:00:00',
            numberOfGuests: 8,
            specialNotes: 'Khách VIP - Cần phòng riêng'
          },
          startTime: '2024-03-20T19:00:00',
          endTime: '2024-03-20T20:30:00'
        },
        {
          tableCode: 'T1-01',
          subtotal: 180000,
          tax: 18000,
          total: 198000,
          paymentMethod: 'cash',
          paymentStatus: 'completed',
          timestamp: new Date('2024-03-21T12:30:00').toISOString(),
          orderItems: [
            { id: '7', name: 'Cơm tấm', quantity: 2, price: 45000, category: 'Món chính' },
            { id: '8', name: 'Canh chua', quantity: 1, price: 35000, category: 'Món chính' },
            { id: '9', name: 'Nước mía', quantity: 2, price: 25000, category: 'Đồ uống' }
          ],
          bookingInfo: {
            customerName: 'Trần Thị B',
            phoneNumber: '0987654321',
            reservationTime: '2024-03-21T12:00:00',
            numberOfGuests: 3
          },
          startTime: '2024-03-21T12:00:00',
          endTime: '2024-03-21T12:30:00'
        },
        {
          tableCode: 'T2-01',
          subtotal: 320000,
          tax: 32000,
          total: 352000,
          paymentMethod: 'qr',
          paymentStatus: 'completed',
          timestamp: new Date('2024-03-21T19:45:00').toISOString(),
          orderItems: [
            { id: '10', name: 'Gà nướng', quantity: 1, price: 180000, category: 'Món chính' },
            { id: '11', name: 'Rau xào', quantity: 2, price: 40000, category: 'Món chính' },
            { id: '12', name: 'Bia', quantity: 3, price: 20000, category: 'Đồ uống' }
          ],
          bookingInfo: {
            customerName: 'Phạm Thị D',
            phoneNumber: '0918234567',
            reservationTime: '2024-03-21T19:00:00',
            numberOfGuests: 4
          },
          startTime: '2024-03-21T19:00:00',
          endTime: '2024-03-21T19:45:00'
        }
      ];

      this.paymentHistory = samplePayments;
      this.saveToLocalStorage();
    }
  }

  private getZoneFromTableCode(tableCode: string): string {
    if (tableCode.startsWith('T1-')) return 'Tầng 1';
    if (tableCode.startsWith('T2-')) return 'Tầng 2';
    if (tableCode.startsWith('T3-')) return 'Tầng 3 - VIP';
    return 'Khác';
  }
}

export default ReportService; 