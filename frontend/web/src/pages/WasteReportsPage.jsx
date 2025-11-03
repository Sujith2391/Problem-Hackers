import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/common/AdminHeader';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const getAuthToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function WasteReportsPage() {
  const [analytics, setAnalytics] = useState({
    topNoShowUsers: [],
    wastePercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = await getAuthToken();

      // Fetch top 5 no-show users
      const noShowResponse = await fetch(`${API_BASE_URL}/api/admin/analytics/no-show`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const noShowData = await noShowResponse.json();

      // Fetch waste percentage
      const wasteResponse = await fetch(`${API_BASE_URL}/api/admin/analytics/waste`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const wasteData = await wasteResponse.json();

      if (noShowData.success && wasteData.success) {
        setAnalytics({
          topNoShowUsers: noShowData.data,
          wastePercentage: wasteData.data.wastePercentage
        });
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (error) {
      toast.error(`Failed to fetch analytics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p>Loading analytics...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Waste Reports</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Waste Percentage Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Overall Waste Percentage</h2>
            <div className="text-4xl font-bold text-red-600 mb-2">
              {analytics.wastePercentage.toFixed(1)}%
            </div>
            <p className="text-gray-600">Based on last 7 days data</p>
          </div>

          {/* Top No-Show Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top 5 No-Show Users</h2>
            <div className="space-y-3">
              {analytics.topNoShowUsers.length === 0 ? (
                <p className="text-gray-500">No no-show data available</p>
              ) : (
                analytics.topNoShowUsers.map((user, index) => (
                  <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-500 mr-3">#{index + 1}</span>
                      <div>
                        <span className="font-medium">{user.full_name || 'N/A'}</span>
                        <span className="text-sm text-gray-500 ml-2">({user.email})</span>
                      </div>
                    </div>
                    <span className="text-red-600 font-semibold">{user.no_show_count} no-shows</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
