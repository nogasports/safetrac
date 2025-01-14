import React from 'react';
import { Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();
  
  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/station')) {
      return 'Station Dashboard';
    } else if (path.startsWith('/substation')) {
      return 'Sub-Station Dashboard';
    }
    return 'Admin Dashboard';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <h2 className="font-alexandria font-semibold text-gray-800">
          {getTitle()}
        </h2>
        
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-1deg hover:bg-gray-100">
            <Bell size={20} className="text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-alexandria font-medium text-gray-800">Demo User</p>
              <p className="text-xs text-gray-500">Demo Mode</p>
            </div>
            <button className="p-2 rounded-1deg hover:bg-gray-100">
              <User size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}