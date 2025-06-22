import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  TableCellsIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Trang chủ', icon: HomeIcon, path: '/' },
    { name: 'Quản lý bàn', icon: TableCellsIcon, path: '/tables' },
    { name: 'Quản lý đơn hàng', icon: ClipboardDocumentListIcon, path: '/orders' },
    { name: 'Đặt bàn', icon: CalendarDaysIcon, path: '/reservations' },
    { name: 'Thanh toán', icon: CreditCardIcon, path: '/payment' },
    { name: 'Báo cáo', icon: ChartBarIcon, path: '/reports' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform 
          transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Restaurant mPOS</h1>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100
                ${location.pathname === item.path ? 'bg-gray-100' : ''}
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white shadow-sm lg:hidden">
          <div className="flex items-center h-full px-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-600"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 