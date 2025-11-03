import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Import our new hook

export default function LoginPage() {
  // Get the signInWithGoogle function from our context
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md w-full">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-700 mb-2">
            🍽️ Karmic Canteen
          </h1>
          <p className="text-gray-600">
            Smart meal management for a sustainable future.
          </p>
        </div>
        
        {/* Login Button */}
        <button
          onClick={signInWithGoogle} // Call the function on click
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors font-medium"
        >
          <img
            src="https://www.google.com/favicon.ico" // Google logo
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>
        
        <p className="text-sm text-gray-500 mt-6">
          Use your official company email to sign in.
        </p>

      </div>
    </div>
  );
}