// frontend/web/src/components/common/QRCodeModal.jsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeModal({ confirmation, onClose }) {
  if (!confirmation) {
    return null; // Don't render if no confirmation is provided
  }

  return (
    // Backdrop (the dark semi-transparent background)
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
    >
      {/* Modal Content */}
      <div 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        className="bg-white rounded-lg shadow-xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold mb-2">Scan Your QR Code</h2>
        <p className="text-gray-600 mb-6">
          Show this to the canteen staff to pick up your {confirmation.meal_type}.
        </p>

        {/* The QR Code Generator */}
        <div className="p-4 bg-white border rounded-lg inline-block">
          <QRCodeSVG 
            value={confirmation.id} // The text inside the QR code
            size={256} 
            includeMargin={true}
          />
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Confirmation ID: {confirmation.id}
        </p>

        <button
          onClick={onClose}
          className="mt-6 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}