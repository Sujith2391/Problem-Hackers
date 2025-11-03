import React from 'react';

export default function MealCard({ title, items, confirmation, onConfirm, disabled = false }) {
  // If no items for this meal, don't show the card
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative">
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {confirmation?.confirmed === true && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Confirmed
          </span>
        )}
        {confirmation?.confirmed === false && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ✗ Skipped
          </span>
        )}
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-4 pr-20">{title}</h3>

      {/* List of menu items (e.g., "Idli", "Sambar") */}
      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-gray-800 font-medium">{item.item_name}</span>
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
            <div className="text-sm text-gray-500">
              {item.description || "Delicious and fresh"}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => onConfirm(true)}
          disabled={disabled}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            confirmation?.confirmed === true
              ? 'bg-green-600 text-white'
              : disabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {confirmation?.confirmed === true ? 'Cancel' : 'Confirm'}
        </button>
        <button
          onClick={() => onConfirm(false)}
          disabled={disabled}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            confirmation?.confirmed === false
              ? 'bg-red-600 text-white'
              : disabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {confirmation?.confirmed === false ? 'Uncancel' : 'Skip'}
        </button>
      </div>
    </div>
  );
}
