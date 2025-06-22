import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  zIndex?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'info',
  zIndex = 'z-50',
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          iconColor: 'text-yellow-500'
        };
      case 'danger':
        return {
          icon: '🚨',
          confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
          iconColor: 'text-red-500'
        };
      default:
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white',
          iconColor: 'text-blue-500'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${zIndex}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start">
            <span className="text-2xl mr-3">{styles.icon}</span>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 