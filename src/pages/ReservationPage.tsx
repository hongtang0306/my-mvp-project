import { useState } from 'react';
import type { Reservation, Table } from '../types';
import reservationData from '../data/reservations.json';
import tableData from '../data/tables.json';

interface ReservationFormData {
  customerName: string;
  phoneNumber: string;
  tableId: string;
  numberOfGuests: number;
  reservationTime: string;
  specialNotes: string;
}

const ReservationPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>(reservationData.reservations as Reservation[]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: '',
    phoneNumber: '',
    tableId: '',
    numberOfGuests: 2,
    reservationTime: '',
    specialNotes: ''
  });

  // Lấy danh sách bàn có thể đặt
  const availableTables = tableData.zones.flatMap(zone => 
    zone.tables.filter(table => table.status === 'available')
  ) as Table[];

  // Xử lý thay đổi form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý đặt bàn
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReservation: Reservation = {
      id: `R${String(reservations.length + 1).padStart(3, '0')}`,
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      tableId: formData.tableId,
      numberOfGuests: formData.numberOfGuests,
      reservationTime: formData.reservationTime,
      specialNotes: formData.specialNotes,
      status: 'pending'
    };

    setReservations(prev => [...prev, newReservation]);
    setIsFormOpen(false);
    setFormData({
      customerName: '',
      phoneNumber: '',
      tableId: '',
      numberOfGuests: 2,
      reservationTime: '',
      specialNotes: ''
    });
  };

  // Xử lý hủy đặt bàn
  const handleCancel = (id: string) => {
    setReservations(prev =>
      prev.map(reservation =>
        reservation.id === id
          ? { ...reservation, status: 'cancelled' }
          : reservation
      )
    );
  };

  // Xử lý xác nhận đặt bàn
  const handleConfirm = (id: string) => {
    setReservations(prev =>
      prev.map(reservation =>
        reservation.id === id
          ? { ...reservation, status: 'confirmed' }
          : reservation
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đặt bàn</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Đặt bàn mới
        </button>
      </div>

      {/* Form đặt bàn */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Đặt bàn mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên khách hàng
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chọn bàn
                </label>
                <select
                  name="tableId"
                  value={formData.tableId}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Chọn bàn</option>
                  {availableTables.map(table => (
                    <option key={table.id} value={table.id}>
                      Bàn {table.id} ({table.seats} chỗ)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số khách
                </label>
                <input
                  type="number"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thời gian
                </label>
                <input
                  type="datetime-local"
                  name="reservationTime"
                  value={formData.reservationTime}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Đặt bàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách đặt bàn */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đặt bàn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bàn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map(reservation => (
              <tr key={reservation.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {reservation.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{reservation.customerName}</div>
                  <div className="text-xs text-gray-400">{reservation.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Bàn {reservation.tableId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(reservation.reservationTime).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full
                    ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}
                  >
                    {reservation.status === 'confirmed' ? 'Đã xác nhận' :
                     reservation.status === 'pending' ? 'Chờ xác nhận' :
                     'Đã hủy'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {reservation.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirm(reservation.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Xác nhận
                      </button>
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationPage; 