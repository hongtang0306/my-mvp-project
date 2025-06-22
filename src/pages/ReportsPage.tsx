import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { Order } from '../types';
import orderData from '../data/orders.json';
import tableData from '../data/tables.json';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportsPage = () => {
  const [timeRange] = useState('today');
  const orders = orderData.orders as Order[];

  // Tính toán các chỉ số
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalRevenue / totalOrders;
  const totalTables = tableData.zones.reduce((sum, zone) => sum + zone.tables.length, 0);
  const occupiedTables = tableData.zones.reduce(
    (sum, zone) => sum + zone.tables.filter(table => table.status !== 'available').length,
    0
  );

  // Dữ liệu cho biểu đồ doanh thu theo danh mục
  const categoryData = [
    { name: 'Món khai vị', revenue: 185000 },
    { name: 'Món chính', revenue: 450000 },
    { name: 'Đồ uống', revenue: 120000 },
  ];

  // Dữ liệu cho biểu đồ trạng thái bàn
  const tableStatusData = [
    { name: 'Trống', value: totalTables - occupiedTables },
    { name: 'Đang phục vụ', value: occupiedTables },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Báo cáo doanh thu</h1>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Tổng doanh thu</h3>
          <p className="text-2xl font-bold mt-2">{totalRevenue.toLocaleString()}đ</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Số đơn hàng</h3>
          <p className="text-2xl font-bold mt-2">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Giá trị trung bình/đơn</h3>
          <p className="text-2xl font-bold mt-2">{Math.round(averageOrderValue).toLocaleString()}đ</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Tỷ lệ lấp đầy</h3>
          <p className="text-2xl font-bold mt-2">
            {Math.round((occupiedTables / totalTables) * 100)}%
          </p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Biểu đồ doanh thu theo danh mục */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Doanh thu theo danh mục</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString()}đ`} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ trạng thái bàn */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Trạng thái bàn</h3>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 