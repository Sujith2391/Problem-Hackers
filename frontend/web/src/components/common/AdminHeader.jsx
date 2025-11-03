// frontend/web/src/components/common/AdminHeader.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function AdminHeader() {
  const { signOut } = useAuth();
  const location = useLocation();

  const navLink = (path, text) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
      >
        {text}
      </Link>
    );
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Logo & Navigation */}
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-primary-700">
              📊 Admin
            </h1>
            <nav className="flex space-x-2">
              {navLink('/admin', 'Dashboard')}
              {navLink('/admin/menu', 'Manage Menu')}
              {navLink('/admin/users', 'User Management')}
            </nav>
          </div>

          {/* Right Side: Sign Out */}
          <div>
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}