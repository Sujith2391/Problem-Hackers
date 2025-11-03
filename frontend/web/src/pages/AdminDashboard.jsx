import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays } from 'date-fns';
import AdminHeader from '../components/common/AdminHeader';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    breakfast: 0,
    lunch: 0,
    snack: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // -- FIX --
  // We check TOMORROW'S stats, as employees confirm for tomorrow.
  const confirmationDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  useEffect(() => {
    // 1. Fetch initial stats
    fetchStats();
    
    // 2. Subscribe to real-time updates
    const channel = supabase.channel('dashboard-updates');
    
    channel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'meal_confirmations',
        filter: `date=eq.${confirmationDate}` // Only listen for changes for tomorrow
      }, 
      (payload) => {
        // When a change happens, re-fetch stats
        console.log('Real-time change received:', payload);
        toast('New confirmation received!', { icon: '🔄' });
        fetchStats();
      })
      .subscribe();
      
    // Cleanup function: unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Only run on initial mount

  const fetchStats = async () => {
    if (!user) return; 
    
    try {
      setLoading(true); // Set loading true only for manual fetch
      const mealTypes = ['breakfast', 'lunch', 'snack'];
      const newStats = {};
      
      // Fetch confirmed count for each meal type
      for (const mealType of mealTypes) {
        const { count, error } = await supabase
          .from('meal_confirmations')
          .select('*', { count: 'exact', head: true }) // count: 'exact' is key
          .eq('date', confirmationDate) // <-- FIX: Use confirmationDate
          .eq('meal_type', mealType)
          .eq('confirmed', true);
          
        if (error) throw error;
        newStats[mealType] = count || 0;
      }
      setStats(newStats);
      
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to load real-time stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && stats.breakfast === 0) { // Only show full loading on initial load
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {/* -- FIX -- */}
            Confirmed Meals for {format(addDays(new Date(), 1), 'EEEE, MMMM d')}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Total count for kitchen preparation (updates in real-time).
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="☀️ Breakfast" count={stats.breakfast} color="yellow" />
          <StatCard title="🍛 Lunch" count={stats.lunch} color="orange" />
          <StatCard title="☕ Evening Snack" count={stats.snack} color="blue" />
        </div>

        {/* Action Buttons (Future Features) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow opacity-60 cursor-not-allowed">
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="font-semibold text-gray-900">Manage Menu (v2)</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add or edit tomorrow's menu items
              </p>
            </div>
          </button>
          <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow opacity-60 cursor-not-allowed">
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold text-gray-900">Waste Reports (v2)</h3>
              <p className="text-sm text-gray-600 mt-1">
                View historical data and waste analytics
              </p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

// Helper component for the stat cards
function StatCard({ title, count, color }) {
  const colorClasses = {
    yellow: 'from-yellow-400 to-yellow-600',
    orange: 'from-orange-400 to-orange-600',
    blue: 'from-blue-400 to-blue-600',
  };
  
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg`}>
      <h3 className="text-lg font-medium mb-2 opacity-90">{title}</h3>
      <div className="text-4xl font-bold">{count}</div>
      <p className="text-sm opacity-75 mt-2">confirmed meals</p>
    </div>
  );
}