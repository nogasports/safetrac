import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Send, AlertTriangle } from 'lucide-react';
import { subscribeToSeals } from '../../lib/seals';
import { ReceiveSealModal } from '../../components/seals/ReceiveSealModal';
import { DispatchSealModal } from '../../components/seals/DispatchSealModal';
import type { Seal } from '../../types/seal';

export const StationSealsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [seals, setSeals] = useState<Seal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeal, setSelectedSeal] = useState<Seal | null>(null);
  const [modalType, setModalType] = useState<'receive' | 'dispatch' | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToSeals((updatedSeals) => {
      setSeals(updatedSeals);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredSeals = seals.filter(seal => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = seal.serialCode.toLowerCase().includes(searchLower) ||
      seal.qrCode.toLowerCase().includes(searchLower);
    const matchesStatus = selectedStatus === 'all' || seal.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-alexandria font-semibold text-gray-800">
          Manage Seals
        </h1>
      </div>

      <div className="bg-white rounded-1deg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Serial Code or QR Code"
                className="w-full pl-10 pr-4 py-2 rounded-1deg border border-gray-200 focus:outline-none focus:border-secondary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-1deg border border-gray-200 focus:outline-none focus:border-secondary"
            >
              <option value="all">All Status</option>
              <option value="Received">Received</option>
              <option value="In Transit">In Transit</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Serial Code</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">QR Code</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Location</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Last Updated</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading seals...
                  </td>
                </tr>
              ) : filteredSeals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No seals found
                  </td>
                </tr>
              ) : filteredSeals.map((seal) => (
                <tr key={seal.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-secondary" />
                      <span className="text-sm font-medium text-gray-800">{seal.serialCode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{seal.qrCode}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-1deg text-xs font-medium
                      ${seal.status === 'Received' ? 'bg-green-100 text-green-800' : 
                        seal.status === 'In Transit' ? 'bg-orange-100 text-orange-800' :
                        seal.status === 'Damaged' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {seal.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {typeof seal.currentStation === 'string' 
                      ? seal.currentStation 
                      : seal.currentStation?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(seal.lastUpdated).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1 hover:bg-gray-100 rounded-1deg text-blue-500
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          setSelectedSeal(seal);
                          setModalType('dispatch');
                        }}
                        disabled={seal.status !== 'Received'}
                      >
                        <Send size={16} />
                      </button>
                      <button 
                        className="p-1 hover:bg-gray-100 rounded-1deg text-green-500
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          setSelectedSeal(seal);
                          setModalType('receive');
                        }}
                        disabled={seal.status !== 'In Transit'}
                      >
                        <Package size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedSeal && modalType === 'receive' && (
        <ReceiveSealModal
          isOpen={true}
          onClose={() => {
            setSelectedSeal(null);
            setModalType(null);
          }}
          onSuccess={() => {
            setSelectedSeal(null);
            setModalType(null);
          }}
          seal={selectedSeal}
        />
      )}
      
      {selectedSeal && modalType === 'dispatch' && (
        <DispatchSealModal
          isOpen={true}
          onClose={() => {
            setSelectedSeal(null);
            setModalType(null);
          }}
          onSuccess={() => {
            setSelectedSeal(null);
            setModalType(null);
          }}
          seal={selectedSeal}
        />
      )}
    </div>
  );
};