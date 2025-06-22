import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import ReportService from '../services/reportService';
import type { 
  PaymentHistory, 
  TableAnalytics,
  PopularDishesAnalytics,
  CustomerAnalytics,
  PaymentMethodAnalytics,
  RevenueByTimeAnalytics,
  OrderAnalytics,
  ProfitAnalytics,
  TableZoneAnalytics
} from '../services/reportService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const TABLE_STATUS_COLORS = ['#82ca9d', '#8884d8'];

// Màu sắc tối ưu cho từng loại dữ liệu
const CHART_COLORS = {
  revenue: '#0088FE',      // Xanh dương cho doanh thu
  profit: '#00C49F',       // Xanh lá cho lợi nhuận
  customers: '#FFBB28',    // Vàng cho khách hàng
  orders: '#FF8042',       // Cam cho đơn hàng
  costs: '#FF6B6B',        // Đỏ cho chi phí
  popular: '#8884D8'       // Tím cho món ăn phổ biến
};

type TabType = 'overview' | 'popular-dishes' | 'customers' | 'payment-methods' | 'revenue-time' | 'orders' | 'profit' | 'table-zones';

const ReportModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState<string>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Analytics data
  const [analytics, setAnalytics] = useState<TableAnalytics | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [popularDishesAnalytics, setPopularDishesAnalytics] = useState<PopularDishesAnalytics | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [paymentMethodAnalytics, setPaymentMethodAnalytics] = useState<PaymentMethodAnalytics | null>(null);
  const [revenueByTimeAnalytics, setRevenueByTimeAnalytics] = useState<RevenueByTimeAnalytics | null>(null);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(null);
  const [profitAnalytics, setProfitAnalytics] = useState<ProfitAnalytics | null>(null);
  const [tableZoneAnalytics, setTableZoneAnalytics] = useState<TableZoneAnalytics | null>(null);

  useEffect(() => {
    const reportService = ReportService.getInstance();
    const history = reportService.getPaymentHistory();
    setPaymentHistory(history);

    const start = dateRange === 'custom' && startDate ? new Date(startDate) : undefined;
    const end = dateRange === 'custom' && endDate ? new Date(endDate) : undefined;
    
    // Load all analytics data
    setAnalytics(reportService.getAnalytics(start, end));
    setPopularDishesAnalytics(reportService.getPopularDishesAnalytics(start, end));
    setCustomerAnalytics(reportService.getCustomerAnalytics(start, end));
    setPaymentMethodAnalytics(reportService.getPaymentMethodAnalytics(start, end));
    setRevenueByTimeAnalytics(reportService.getRevenueByTimeAnalytics(start, end));
    setOrderAnalytics(reportService.getOrderAnalytics(start, end));
    setProfitAnalytics(reportService.getProfitAnalytics(start, end));
    setTableZoneAnalytics(reportService.getTableZoneAnalytics(start, end));
  }, [dateRange, startDate, endDate]);

  if (!analytics) return <div>Loading...</div>;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleDateRangeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value);
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'popular-dishes', label: 'Món ăn yêu thích', icon: '🍽️' },
    { id: 'customers', label: 'Khách hàng', icon: '👥' },
    { id: 'payment-methods', label: 'Phương thức thanh toán', icon: '💳' },
    { id: 'revenue-time', label: 'Doanh thu theo thời gian', icon: '📈' },
    { id: 'orders', label: 'Đơn hàng', icon: '📋' },
    { id: 'profit', label: 'Lợi nhuận', icon: '💰' },
    { id: 'table-zones', label: 'Doanh thu theo khu vực', icon: '🏢' },
  ];

  const renderOverviewTab = () => {
  // Prepare data for revenue by category chart
  const categoryData = analytics.popularDishes.reduce((acc, dish) => {
    const category = dish.category || 'Khác';
    acc[category] = (acc[category] || 0) + dish.revenue;
    return acc;
  }, {} as Record<string, number>);

  const revenueByCategory = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  // Prepare data for table status chart
  const tableStatusData = [
    { name: 'Trống', value: 43, color: '#1E90FF' },
    { name: 'Đang phục vụ', value: 57, color: '#00C49F' },
  ];

  return (
      <>
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Tổng doanh thu</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(25200000)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Số đơn hàng</h3>
          <p className="text-2xl font-bold text-green-600">45</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Giá trị TB/đơn</h3>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(560000)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Tỷ lệ lấp đầy bàn</h3>
          <p className="text-2xl font-bold text-orange-600">34.8%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Lượt khách</h3>
          <p className="text-2xl font-bold text-red-600">156</p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Biểu đồ doanh thu theo danh mục */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Doanh thu theo danh mục</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ trạng thái bàn */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Trạng thái bàn</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tableStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tableStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TABLE_STATUS_COLORS[index % TABLE_STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      </>
    );
  };

  const renderPopularDishesTab = () => {
    if (!popularDishesAnalytics) return <div>Loading...</div>;

    // Chỉ lấy top 3 món ăn
    const top3Dishes = popularDishesAnalytics.dishes.slice(0, 3);

    return (
      <div className="space-y-6">
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng doanh thu món ăn</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(popularDishesAnalytics.totalRevenue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng số đơn hàng</h3>
            <p className="text-2xl font-bold text-green-600">{popularDishesAnalytics.totalOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Top 3 món bán chạy</h3>
            <p className="text-2xl font-bold text-purple-600">{top3Dishes.length}</p>
          </div>
        </div>

        {/* Biểu đồ pie top 3 món ăn */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top 3 món ăn bán chạy nhất</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={top3Dishes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, revenue }) => `${name}: ${formatCurrency(revenue)}`}
                    outerRadius={100}
                    fill={CHART_COLORS.popular}
                    dataKey="revenue"
                  >
                    {top3Dishes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Thống kê chi tiết top 3 */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Chi tiết top 3 món ăn</h3>
            <div className="space-y-4">
              {top3Dishes.map((dish, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{dish.name}</h4>
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Số lượng:</span>
                      <span className="ml-2 font-medium">{dish.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Doanh thu:</span>
                      <span className="ml-2 font-medium text-blue-600">{formatCurrency(dish.revenue)}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-500">Danh mục:</span>
                    <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">{dish.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomersTab = () => {
    if (!customerAnalytics) return <div>Loading...</div>;

    // Chỉ lấy 7 ngày gần đây nhất
    const recentCustomers = customerAnalytics.dailyCustomers.slice(-7);

    return (
      <div className="space-y-6">
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng số khách hàng</h3>
            <p className="text-2xl font-bold text-blue-600">{customerAnalytics.totalCustomers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Trung bình khách/ngày</h3>
            <p className="text-2xl font-bold text-green-600">{customerAnalytics.averageCustomersPerDay.toFixed(1)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Trung bình 7 ngày gần đây</h3>
            <p className="text-2xl font-bold text-purple-600">
              {(recentCustomers.reduce((sum, day) => sum + day.count, 0) / recentCustomers.length).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Biểu đồ khách hàng theo ngày (7 ngày gần đây) */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Số lượng khách hàng theo ngày (7 ngày gần đây)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentCustomers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill={CHART_COLORS.customers} name="Số khách" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Thống kê chi tiết 7 ngày gần đây */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Chi tiết 7 ngày gần đây</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCustomers.map((day, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">{day.date}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số khách:</span>
                    <span className="font-medium text-blue-600">{day.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doanh thu:</span>
                    <span className="font-medium text-green-600">{formatCurrency(day.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TB/khách:</span>
                    <span className="font-medium text-purple-600">
                      {day.count > 0 ? formatCurrency(day.revenue / day.count) : '0đ'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentMethodsTab = () => {
    if (!paymentMethodAnalytics) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng doanh thu</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(paymentMethodAnalytics.totalRevenue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Số phương thức thanh toán</h3>
            <p className="text-2xl font-bold text-green-600">{paymentMethodAnalytics.methods.length}</p>
          </div>
        </div>

        {/* Biểu đồ phương thức thanh toán */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Phân bố phương thức thanh toán</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodAnalytics.methods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ method, percentage }) => `${method}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {paymentMethodAnalytics.methods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Doanh thu theo phương thức</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodAnalytics.methods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" fill={CHART_COLORS.revenue} name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRevenueByTimeTab = () => {
    if (!revenueByTimeAnalytics) return <div>Loading...</div>;

    // Chỉ lấy 7 ngày gần đây nhất
    const recentDailyRevenue = revenueByTimeAnalytics.dailyRevenue.slice(-7);

    return (
      <div className="space-y-6">
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Giờ cao điểm</h3>
            <p className="text-2xl font-bold text-blue-600">{revenueByTimeAnalytics.peakHour}:00</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Doanh thu cao nhất/giờ</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(revenueByTimeAnalytics.peakRevenue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng doanh thu (7 ngày)</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(recentDailyRevenue.reduce((sum, day) => sum + day.revenue, 0))}
            </p>
          </div>
        </div>

        {/* Biểu đồ doanh thu theo ngày (7 ngày gần đây) */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Doanh thu theo ngày (7 ngày gần đây)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentDailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ doanh thu theo giờ (đơn giản hóa) */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Doanh thu theo giờ trong ngày</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByTimeAnalytics.hourlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={CHART_COLORS.revenue} 
                  strokeWidth={3} 
                  name="Doanh thu" 
                  dot={{ fill: CHART_COLORS.revenue, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderOrdersTab = () => {
    if (!orderAnalytics) return <div>Loading...</div>;

    // Chỉ lấy 7 ngày gần đây nhất
    const recentOrders = orderAnalytics.dailyOrders.slice(-7);

    return (
      <div className="space-y-6">
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng số đơn hàng</h3>
            <p className="text-2xl font-bold text-blue-600">{orderAnalytics.totalOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Giá trị TB/đơn</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(orderAnalytics.averageOrderValue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Trung bình 7 ngày gần đây</h3>
            <p className="text-2xl font-bold text-purple-600">
              {(recentOrders.reduce((sum, day) => sum + day.orders, 0) / recentOrders.length).toFixed(1)} đơn/ngày
            </p>
          </div>
        </div>

        {/* Biểu đồ đơn hàng theo ngày (7 ngày gần đây) */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Số lượng đơn hàng theo ngày (7 ngày gần đây)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill={CHART_COLORS.orders} name="Số đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Thống kê chi tiết 7 ngày gần đây */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Chi tiết 7 ngày gần đây</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOrders.map((day, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">{day.date}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số đơn:</span>
                    <span className="font-medium text-blue-600">{day.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doanh thu:</span>
                    <span className="font-medium text-green-600">{formatCurrency(day.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TB/đơn:</span>
                    <span className="font-medium text-purple-600">{formatCurrency(day.averageOrderValue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProfitTab = () => {
    if (!profitAnalytics) return <div>Loading...</div>;

    // Chỉ lấy 7 ngày gần đây nhất
    const recentProfit = profitAnalytics.dailyProfit.slice(-7);

    return (
      <div className="space-y-6">
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng doanh thu</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(profitAnalytics.revenue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng chi phí</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(profitAnalytics.costs)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng lợi nhuận</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(profitAnalytics.profit)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tỷ suất lợi nhuận</h3>
            <p className="text-2xl font-bold text-purple-600">{profitAnalytics.profitMargin.toFixed(1)}%</p>
          </div>
        </div>

        {/* Biểu đồ lợi nhuận theo ngày (đơn giản hóa) */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Doanh thu và Lợi nhuận theo ngày (7 ngày gần đây)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentProfit}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={3} 
                  name="Doanh thu" 
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#82ca9d" 
                  strokeWidth={3} 
                  name="Lợi nhuận" 
                  dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Thống kê chi tiết 7 ngày gần đây */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Chi tiết 7 ngày gần đây</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProfit.map((day, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">{day.date}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doanh thu:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(day.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lợi nhuận:</span>
                    <span className="font-medium text-green-600">{formatCurrency(day.profit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tỷ lệ:</span>
                    <span className="font-medium text-purple-600">
                      {day.revenue > 0 ? ((day.profit / day.revenue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTableZonesTab = () => {
    if (!tableZoneAnalytics) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng doanh thu</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(tableZoneAnalytics.totalRevenue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Số khu vực</h3>
            <p className="text-2xl font-bold text-green-600">{tableZoneAnalytics.zones.length}</p>
          </div>
        </div>

        {/* Biểu đồ doanh thu theo khu vực */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Doanh thu theo khu vực</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tableZoneAnalytics.zones}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ zone, revenue }) => `${zone}: ${formatCurrency(revenue)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {tableZoneAnalytics.zones.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Số đơn hàng theo khu vực</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tableZoneAnalytics.zones}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#82ca9d" name="Số đơn hàng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'popular-dishes':
        return renderPopularDishesTab();
      case 'customers':
        return renderCustomersTab();
      case 'payment-methods':
        return renderPaymentMethodsTab();
      case 'revenue-time':
        return renderRevenueByTimeTab();
      case 'orders':
        return renderOrdersTab();
      case 'profit':
        return renderProfitTab();
      case 'table-zones':
        return renderTableZonesTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Báo cáo tổng hợp</h2>
        <select
          value={dateRange}
          onChange={handleDateRangeChange}
          className="border rounded-md px-3 py-2"
        >
          <option value="today">Hôm nay</option>
          <option value="yesterday">Hôm qua</option>
          <option value="thisWeek">Tuần này</option>
          <option value="thisMonth">Tháng này</option>
          <option value="custom">Tùy chọn...</option>
        </select>
      </div>

      {/* Filters */}
      <div className="mt-8 mb-4">
        {dateRange === 'custom' && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded-lg mr-4"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded-lg"
            />
          </>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          {renderTabContent()}
        </div>
      </div>

      {/* Payment History Table - Only show in overview tab */}
      {activeTab === 'overview' && (
      <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Lịch sử thanh toán</h3>
          </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bàn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chi tiết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tạm tính
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VAT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng cộng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentHistory.map((payment, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.tableCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      {payment.orderItems.map((item, i) => (
                        <div key={i} className="truncate">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(payment.subtotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(payment.tax)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {formatCurrency(payment.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};

export default ReportModule; 