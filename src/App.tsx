import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TableManagement from './components/TableManagement';
import OrderManagement from './components/OrderManagement';
import BookingManagement from './components/BookingManagement';
import PaymentManagement from './components/PaymentManagement';
import ReportModule from './components/ReportModule';
import MenuManagement from './components/MenuManagement';
import TableConfiguration from './components/TableConfiguration';
import CustomerHistoryPage from './pages/CustomerHistoryPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen">
        {/* Navigation Sidebar */}
        <nav className="w-64 bg-gray-100 p-6">
          <h1 className="text-xl font-bold mb-8">Restaurant mPOS</h1>
          <ul className="space-y-4">
            <li>
              <Link
                to="/"
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                to="/tables"
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Quản lý bàn
              </Link>
            </li>
            <li>
              <Link
                to="/table-config"
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Cấu hình bàn ăn
              </Link>
            </li>
            <li>
              <Link
                to="/menu"
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Quản lý Menu
              </Link>
            </li>
            <li>
              <Link
                to="/customer-history"
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Lịch sử khách hàng
              </Link>
            </li>
            <li>
              <Link
                to="/comprehensive-report"
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Báo cáo tổng hợp
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50">
          <Routes>
            <Route path="/" element={<div>Trang chủ</div>} />
            <Route path="/tables" element={<TableManagement />} />
            <Route path="/table-config" element={<TableConfiguration />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/bookings" element={<BookingManagement />} />
            <Route path="/payments" element={<PaymentManagement />} />
            <Route path="/customer-history" element={<CustomerHistoryPage />} />
            <Route path="/comprehensive-report" element={<ReportModule />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
