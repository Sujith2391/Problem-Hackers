import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManageMenuPage from './pages/ManageMenuPage';
import UserManagementPage from './pages/UserManagementPage';
import { Toaster } from 'react-hot-toast';

// Add these two helper functions right after your imports

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}

function DashboardRouter() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to="/admin" />;
  }

  return <EmployeeDashboard />;
}

function App() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100" />
    );
  }

  return (
    <div>
      <Toaster position="top-right" />

      <Routes>
        <Route
          path="/"
          element={
            user ? (isAdmin ? <AdminDashboard /> : <EmployeeDashboard />) : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute adminOnly>
              <ManageMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" /> : <LoginPage />
          }
        />
      </Routes>
    </div>
  );
}

// ... (No more HomePage function)

export default App;