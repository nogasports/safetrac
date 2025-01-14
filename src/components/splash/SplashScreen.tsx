import React from 'react';
import { Package } from 'lucide-react';

export const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center">
      <div className="flex items-center gap-4 animate-pulse">
        <Package className="text-secondary" size={60} />
        <div>
          <h1 className="text-6xl font-alexandria font-bold text-secondary">
            Safetrac
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Seal Management System
          </p>
        </div>
      </div>
    </div>
  );
};