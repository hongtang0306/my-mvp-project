import React from 'react';
import { Link } from 'react-router-dom';

const TableDetails = ({ table }) => {
  // Hàm để xác định màu sắc dựa trên trạng thái
  const getStatusColor = () => {
    switch (table.status) {
      case 'empty':
        return 'bg-white';
      case 'serving':
        return 'bg-blue-100';
      case 'reserved':
        return 'bg-yellow-100';
      default:
        return 'bg-white';
    }
  };

  // Hiển thị thông tin dựa trên trạng thái
  const renderContent = () => {
    switch (table.status) {
      case 'empty':
        return (
          <div className="space-y-2">
            <p className="text-gray-600">Mã bàn: {table.code}</p>
            <p className="text-gray-600">Số ghế: {table.seats}</p>
            <p className="text-gray-600">Khu vực: {table.zone}</p>
            <p className="font-medium text-green-600">Trạng thái: Trống</p>
          </div>
        );

      case 'serving':
        return (
          <div className="space-y-3">
            <div className="border-b pb-2">
              <h3 className="font-medium">Thông tin khách hàng:</h3>
              <p className="text-gray-600">Tên: {table.customer?.name}</p>
              <p className="text-gray-600">SĐT: {table.customer?.phone}</p>
            </div>
            <div className="border-b pb-2">
              <p className="text-gray-600">Số ghế: {table.seats}</p>
              <p className="text-gray-600">Khu vực: {table.zone}</p>
              <p className="text-gray-600">Thời gian: {table.reservationTime}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Món đang phục vụ:</h3>
              <ul className="list-disc list-inside space-y-1">
                {table.items?.map((item, index) => (
                  <li key={index} className="text-gray-600">
                    {item.name} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to={`/order/${table.id}`}
              className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Thêm món
            </Link>
          </div>
        );

      case 'reserved':
        return (
          <div className="space-y-3">
            <div className="border-b pb-2">
              <h3 className="font-medium">Thông tin đặt bàn:</h3>
              <p className="text-gray-600">Tên: {table.customer?.name}</p>
              <p className="text-gray-600">SĐT: {table.customer?.phone}</p>
            </div>
            <div>
              <p className="text-gray-600">Số khách: {table.numberOfGuests}</p>
              <p className="text-gray-600">Thời gian đặt: {table.reservationTime}</p>
              <p className="text-gray-600">Khu vực: {table.zone}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow-md ${getStatusColor()}`}>
      <div className="border-b pb-2 mb-4">
        <h2 className="text-xl font-bold">{table.code}</h2>
      </div>
      {renderContent()}
    </div>
  );
};

export default TableDetails; 