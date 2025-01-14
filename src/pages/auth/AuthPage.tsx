import React from 'react';
import { Package, Building2, MapPin, Warehouse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3">
          <Package className="text-secondary" size={40} />
          <h1 className="text-4xl font-alexandria font-bold text-secondary">
            Safetrac
          </h1>
        </div>
        <h2 className="mt-6 text-center text-3xl font-alexandria font-bold text-gray-900">
          Select Portal
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white p-8 shadow-lg sm:rounded-1deg border border-gray-200">
          <div className="grid grid-cols-1 gap-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-4 p-6 border-2 border-gray-200 rounded-1deg hover:border-secondary hover:bg-gray-50 transition-all"
            >
              <div className="p-3 bg-secondary/10 rounded-1deg">
                <Building2 size={24} className="text-secondary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-alexandria font-semibold text-gray-800">
                  Admin Portal
                </h3>
                <p className="text-sm text-gray-600">
                  Manage all stations, seals, and users
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/station')}
              className="flex items-center gap-4 p-6 border-2 border-gray-200 rounded-1deg hover:border-secondary hover:bg-gray-50 transition-all"
            >
              <div className="p-3 bg-blue-50 rounded-1deg">
                <Warehouse size={24} className="text-blue-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-alexandria font-semibold text-gray-800">
                  Station Portal
                </h3>
                <p className="text-sm text-gray-600">
                  Manage station seals and operations
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/substation')}
              className="flex items-center gap-4 p-6 border-2 border-gray-200 rounded-1deg hover:border-secondary hover:bg-gray-50 transition-all"
            >
              <div className="p-3 bg-green-50 rounded-1deg">
                <MapPin size={24} className="text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-alexandria font-semibold text-gray-800">
                  Sub-Station Portal
                </h3>
                <p className="text-sm text-gray-600">
                  Track and manage deployed seals
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};