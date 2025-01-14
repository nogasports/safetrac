import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Settings, Package, Activity, Send, AlertTriangle } from 'lucide-react';
import { subscribeToSeals } from '../../lib/seals';
import { AddSealModal } from '../../components/seals/AddSealModal';
import { ManageSealModal } from '../../components/seals/ManageSealModal';
import type { Seal } from '../../types/seal';

export const SealsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [seals, setSeals] = useState<Seal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSeal, setSelectedSeal] = useState<Seal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToSeals((updatedSeals) => {
      setSeals(updatedSeals);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredSeals = seals.filter(seal => {
    const searchLower = searchTerm.toLowerCase();
    return (
      seal.serialCode.toLowerCase().includes(searchLower) ||
      seal.qrCode.toLowerCase().includes(searchLower) ||
      seal.currentStation?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: seals.length,
    inTransit: seals.filter(s => s.status === 'In Transit').length,
    received: seals.filter(s => s.status === 'Received').length,
    issued: seals.filter(s => s.status === 'Issued').length,
    damaged: seals.filter(s => s.status === 'Damaged').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-alexandria font-semibold text-gray-800">
          Seals Management
        </h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-secondary text-white px-4 py-2 rounded-1deg flex items-center gap-2 hover:bg-secondary/90"
        >
          <Plus size={20} />
          Add New Seal
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-secondary" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Total Seals</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-green-500" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Received</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-green-500">{stats.received}</p>
        </div>
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Send className="text-blue-500" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Issued</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-blue-500">{stats.issued}</p>
        </div>
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-orange-500" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">In Transit</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-orange-500">{stats.inTransit}</p>
        </div>
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Damaged</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-red-500">{stats.damaged}</p>
        </div>
      </div>

      <div className="bg-white rounded-1deg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Serial Code, QR Code, or Station"
                className="w-full pl-10 pr-4 py-2 rounded-1deg border border-gray-200 focus:outline-none focus:border-secondary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 rounded-1deg border border-gray-200 flex items-center gap-2 hover:bg-gray-50">
              <Filter size={20} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Serial Code</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Source Station</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Destination</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Received Date</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Last Updated</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading seals...
                  </td>
                </tr>
              ) : filteredSeals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No seals found
                  </td>
                </tr>
              ) : filteredSeals.map((seal) => (
                <tr key={seal.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{seal.serialCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{seal.sourceStation || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{seal.destinationStation || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-1deg text-xs font-alexandria font-medium
                      ${seal.status === 'Received' ? 'bg-green-100 text-green-800' : 
                        seal.status === 'Issued' ? 'bg-blue-100 text-blue-800' :
                        seal.status === 'In Transit' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {seal.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{seal.receivedDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{seal.lastUpdated}</td>
                  <td className="px-4 py-3 text-sm">
                    <button 
                      onClick={() => setSelectedSeal(seal)}
                      className="text-secondary hover:text-secondary/80"
                    >
                      <Settings size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredSeals.length}</span> of{' '}
              <span className="font-medium">{seals.length}</span> seals
            </p>
          </div>
        </div>
      </div>
      
      <AddSealModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          // Refresh will happen automatically via subscription
        }}
      />
      
      {selectedSeal && (
        <ManageSealModal
          isOpen={true}
          onClose={() => setSelectedSeal(null)}
          onSuccess={() => {
            setSelectedSeal(null);
            // Refresh will happen automatically via subscription
          }}
          seal={selectedSeal}
        />
      )}
    </div>
  );
};