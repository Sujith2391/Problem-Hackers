import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import MealCard from '../components/employee/MealCard';
import QRCodeModal from '../components/common/QRCodeModal.jsx';
import { format, addDays } from 'date-fns'; // We use this to get tomorrow's date

export default function EmployeeDashboard() {
  const { user, profile, signOut } = useAuth(); // Get user and profile
  const [menuItems, setMenuItems] = useState([]);
  const [confirmations, setConfirmations] = useState({});
  const [loading, setLoading] = useState(true);
  const [showQRModalFor, setShowQRModalFor] = useState(null); // 2. Add new state
  const [userStatus, setUserStatus] = useState(null); // <-- ADD THIS

  // Get tomorrow's date in 'YYYY-MM-DD' format
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  useEffect(() => {
    // This function runs when the page loads
    fetchMenuAndConfirmations();
  }, [user]); // Re-run if the user changes

  const fetchMenuAndConfirmations = async () => {
    if (!user) return; // Don't run if user is not logged in
    
    try {
      setLoading(true);
      
      // 1. Fetch tomorrow's menu
      const { data: menu, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('date', tomorrow)
        .order('meal_type');

      if (menuError) throw menuError;
      setMenuItems(menu || []);

      // 2. Fetch user's existing confirmations for tomorrow
      const { data: userConfirmations, error: confirmError } = await supabase
        .from('meal_confirmations')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', tomorrow);

      if (confirmError) throw confirmError;

      // Convert confirmations array to an easy-to-use object:
      // { breakfast: true, lunch: false }
      const confirmMap = {};
      (userConfirmations || []).forEach(conf => {
        // OLD: confirmMap[conf.meal_type] = conf.confirmed;
        confirmMap[conf.meal_type] = conf; // NEW: Store the whole object
      });
      setConfirmations(confirmMap);

      // 3. Fetch user's status for tomorrow
      const { data: statusData, error: statusError } = await supabase
        .from('user_daily_status')
        .select('status')
        .eq('user_id', user.id)
        .eq('date', tomorrow)
        .single();

      if (statusError && statusError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw statusError;
      }

      if (statusData) {
        setUserStatus(statusData.status);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load menu. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Called when a user clicks "Confirm" or "Skip"
  const handleConfirmation = async (mealType, confirmed) => {
    try {
      const toastId = toast.loading('Saving...');

      // Find the menu item ID for this meal type
      const menuItem = menuItems.find(item => item.meal_type === mealType);

      // "upsert" = Update if exists, Insert if it doesn't.
      const { error } = await supabase
        .from('meal_confirmations')
        .upsert({
          user_id: user.id,
          menu_item_id: menuItem ? menuItem.id : null,
          date: tomorrow,
          meal_type: mealType,
          confirmed: confirmed
        }, {
          onConflict: 'user_id,date,meal_type' // This is the unique key we made in SQL
        });

      if (error) throw error;

      // Update our local state to show the change immediately
      setConfirmations(prev => ({
        ...prev,
        [mealType]: confirmed ? { ...prev[mealType], confirmed: true } : { ...prev[mealType], confirmed: false }
      }));

      toast.success(confirmed ? 'Meal confirmed!' : 'Meal skipped', { id: toastId });

    } catch (error) {
      console.error('Confirmation error:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const toastId = toast.loading('Updating status...');

      const { data, error } = await supabase
        .from('user_daily_status')
        .upsert({
          user_id: user.id,
          date: tomorrow,
          status: newStatus
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) throw error;

      setUserStatus(data.status);
      toast.success('Status updated!', { id: toastId });

      // If user is WFH or on leave, cancel their meals
      if (newStatus === 'wfh' || newStatus === 'leave') {
        await handleConfirmation('breakfast', false);
        await handleConfirmation('lunch', false);
        await handleConfirmation('snack', false);
        toast.success('Meals for tomorrow automatically cancelled.', {
           icon: 'ℹ️'
        });
      }

    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status.');
    }
  };

  // Group the menu items by meal type
  const groupedMenu = {
    breakfast: menuItems.filter(item => item.meal_type === 'breakfast'),
    lunch: menuItems.filter(item => item.meal_type === 'lunch'),
    snack: menuItems.filter(item => item.meal_type === 'snack')
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary-700">
                🍽️ Karmic Canteen
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {profile?.full_name || user?.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Yellow Alert Banner */}
        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Confirm your meals for tomorrow by <strong>9:00 PM tonight</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Date Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Menu for {format(addDays(new Date(), 1), 'EEEE, MMMM d')}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Select the meals you'd like to have tomorrow.
          </p>
        </div>

        {/* --- ADD THIS NEW STATUS SELECTOR COMPONENT --- */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What's your plan for {format(addDays(new Date(), 1), 'EEEE')}?
          </h3>
          <div className="flex gap-3">
            {/* WFO Button */}
            <button
              onClick={() => handleStatusUpdate('wfo')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                userStatus === 'wfo'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
              }`}
            >
              🏢 Work from Office
            </button>
            {/* WFH Button */}
            <button
              onClick={() => handleStatusUpdate('wfh')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                userStatus === 'wfh'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100'
              }`}
            >
              🏠 Work from Home
            </button>
            {/* Leave Button */}
            <button
              onClick={() => handleStatusUpdate('leave')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                userStatus === 'leave'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-100'
              }`}
            >
              🌴 On Leave
            </button>
          </div>
        </div>

        {/* Conditionally show meal cards */}
        {userStatus === 'wfo' && (
          <div className="space-y-6">
            {/* Your <MealCard ... /> components go inside here */}
            <MealCard
              title="☀️ Breakfast"
              items={groupedMenu.breakfast}
              confirmation={confirmations.breakfast}
              onConfirm={(confirmed) => handleConfirmation('breakfast', confirmed)}
              onShowQR={() => setShowQRModalFor(confirmations.breakfast)}
            />
            <MealCard
              title="🍛 Lunch"
              items={groupedMenu.lunch}
              confirmation={confirmations.lunch}
              onConfirm={(confirmed) => handleConfirmation('lunch', confirmed)}
              onShowQR={() => setShowQRModalFor(confirmations.lunch)}
            />
            <MealCard
              title="☕ Evening Snack"
              items={groupedMenu.snack}
              confirmation={confirmations.snack}
              onConfirm={(confirmed) => handleConfirmation('snack', confirmed)}
              onShowQR={() => setShowQRModalFor(confirmations.snack)}
            />

            {/* Message if no menu is set */}
            {menuItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">
                  No menu has been set for tomorrow.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Please check back later or contact the canteen admin.
                </p>
              </div>
            )}
          </div>
        )}

        {userStatus !== 'wfo' && userStatus !== null && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-600 text-lg">
              {userStatus === 'wfh' ? 'Enjoy working from home!' : 'Enjoy your leave!'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Meal selection is disabled as you won't be in the office.
            </p>
          </div>
        )}

        {userStatus === null && (
           <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">
              Please select your work status above to view the menu.
            </p>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading menu...</p>
          </div>
        )}



        {/* QR Code Modal */}
        {showQRModalFor && (
          <QRCodeModal
            confirmation={showQRModalFor}
            onClose={() => setShowQRModalFor(null)}
          />
        )}
      </main>
    </div>
  );
}
