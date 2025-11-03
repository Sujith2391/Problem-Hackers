import React from 'react';

export default function MealCard({ title, items, confirmation, onConfirm, onShowQR }) {
  // If no items for this meal, don't show the card
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      
      {/* List of menu items (e.g., "Idli", "Sambar") */}
      <div className="space-y-2 mb-6">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-gray-700">{item.item_name}</span>
            {item.is_vegetarian && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Veg
              </span>
            )}
            {!item.is_vegetarian && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                Non-Veg
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Confirmation Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => onConfirm(true)}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            confirmation?.confirmed === true
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {confirmation?.confirmed === true ? '✓ Confirmed' : 'Confirm'}
        </button>
        <button
          onClick={() => onConfirm(false)}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            confirmation?.confirmed === false
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {confirmation?.confirmed === false ? '✓ Cancelled' : 'Skip'}
        </button>
      </div>

      {/* Show QR Code Button - Only if confirmed */}
      {confirmation?.confirmed === true && (
        <div className="pt-4 border-t border-gray-200 mt-4">
          <button
            onClick={() => onShowQR()}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            📱 Show QR Code
          </button>
        </div>
      )}
    </div>
  );
}