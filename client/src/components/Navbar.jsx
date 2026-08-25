import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-indigo-600 hidden sm:block">
              Smart Budget Tracker
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium hidden sm:block">{user?.name}</span>
            <button
              onClick={logout}
              className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
