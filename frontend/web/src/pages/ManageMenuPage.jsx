// frontend/web/src/pages/ManageMenuPage.jsx
import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/common/AdminHeader';

import { supabase } from '../lib/supabase'; // We need this to get the auth token
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

// Helper to get the auth token
const getAuthToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ManageMenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the new item form
  const [newItemName, setNewItemName] = useState('');
  const [newMealType, setNewMealType] = useState('lunch');
  const [isVegetarian, setIsVegetarian] = useState(true);

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  // Fetch tomorrow's menu when page loads
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/menu/tomorrow`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(`Failed to fetch menu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle submitting the new item form
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName) {
      toast.error('Item name is required');
      return;
    }

    const toastId = toast.loading('Adding item...');
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: tomorrow,
          meal_type: newMealType,
          item_name: newItemName,
          is_vegetarian: isVegetarian
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Item added!', { id: toastId });
        setItems([...items, data.data]); // Add new item to the list
        setNewItemName(''); // Reset form
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(`Failed to add item: ${error.message}`, { id: toastId });
    }
  };

  // Handle deleting a menu item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Item deleted!');
        setItems(items.filter(item => item.id !== id)); // Remove item from list
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(`Failed to delete item: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Add New Item Form */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input 
                    type="text" 
                    value={tomorrow} 
                    disabled 
                    className="w-full mt-1 p-2 bg-gray-100 border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meal Type</label>
                  <select 
                    value={newMealType}
                    onChange={(e) => setNewMealType(e.target.value)}
                    className="w-full mt-1 p-2 border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <input 
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g., Veg Pulao"
                    className="w-full mt-1 p-2 border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    id="is_vegetarian"
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label htmlFor="is_vegetarian" className="ml-2 text-sm text-gray-700">
                    Vegetarian
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                >
                  Add Item
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Tomorrow's Menu List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Menu for Tomorrow ({tomorrow})
              </h2>
              {loading ? (
                <p>Loading menu...</p>
              ) : (
                <ul className="space-y-3">
                  {items.length === 0 && <p className="text-gray-500">No items added for tomorrow yet.</p>}
                  {items.map(item => (
                    <li key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.item_name}</span>
                        <span className="text-sm text-gray-500 ml-2">({item.meal_type})</span>
                        {item.is_vegetarian && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-2">Veg</span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}