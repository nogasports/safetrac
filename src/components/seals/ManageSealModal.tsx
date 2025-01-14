import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Seal, SealStatus } from '../../types/seal';
import type { Station } from '../../types/station';
import { updateSeal } from '../../lib/seals';
import { subscribeToStations } from '../../lib/stations';

interface ManageSealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  seal: Seal;
}

export const ManageSealModal: React.FC<ManageSealModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  seal 
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<'issue' | 'status' | 'utilization' | null>(null);
  
  // Form states
  const [selectedStation, setSelectedStation] = useState('');
  const [sealCondition, setSealCondition] = useState<'good' | 'damaged' | 'repaired'>('good');
  const [isInUse, setIsInUse] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToStations((updatedStations) => {
      setStations(updatedStations);
    });

    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleIssue = async () => {
    setLoading(true);
    setError(null);

    try {
      const station = stations.find(s => s.id === selectedStation);
      if (!station) throw new Error('Invalid station selected');

      await updateSeal(seal.id, {
        status: 'Issued',
        destinationStation: station.name,
        sourceStation: seal.currentStation,
        isUnutilized: false,
        issuedTo: {
          name: station.manager.name,
          id: station.manager.id,
          timestamp: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      const status: SealStatus = sealCondition === 'good' ? 'Available' :
        sealCondition === 'damaged' ? 'Damaged' : 'Repaired';

      await updateSeal(seal.id, {
        status,
        lastUpdated: new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUtilizationUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      await updateSeal(seal.id, {
        isUnutilized: !isInUse,
        lastUpdated: new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-1deg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-alexandria font-semibold text-gray-800">
            Manage Seal: {seal.serialCode}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {!action ? (
          <div className="space-y-4">
            <button
              onClick={() => setAction('issue')}
              className="w-full p-4 text-left border border-gray-200 rounded-1deg hover:bg-gray-50 flex items-center gap-3"
            >
              <Send className="text-secondary" size={20} />
              <div>
                <h3 className="font-alexandria font-medium text-gray-800">Issue Seal</h3>
                <p className="text-sm text-gray-600">Issue seal to another station</p>
              </div>
            </button>

            <button
              onClick={() => setAction('status')}
              className="w-full p-4 text-left border border-gray-200 rounded-1deg hover:bg-gray-50 flex items-center gap-3"
            >
              <AlertTriangle className="text-yellow-500" size={20} />
              <div>
                <h3 className="font-alexandria font-medium text-gray-800">Update Status</h3>
                <p className="text-sm text-gray-600">Change seal condition status</p>
              </div>
            </button>

            <button
              onClick={() => setAction('utilization')}
              className="w-full p-4 text-left border border-gray-200 rounded-1deg hover:bg-gray-50 flex items-center gap-3"
            >
              <CheckCircle className="text-green-500" size={20} />
              <div>
                <h3 className="font-alexandria font-medium text-gray-800">Update Utilization</h3>
                <p className="text-sm text-gray-600">Mark seal as in use or not in use</p>
              </div>
            </button>
          </div>
        ) : action === 'issue' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                Issue To Station
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
              >
                <option value="">Select a station</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name} - {station.location.address}
                  </option>
                ))}
              </select>
            </div>

            {selectedStation && (
              <div className="p-4 bg-gray-50 rounded-1deg">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Source Station</p>
                    <p className="text-sm text-gray-600">
                      {typeof seal.currentStation === 'string' 
                        ? seal.currentStation 
                        : seal.currentStation?.name || '-'}
                    </p>
                  </div>
                  <ArrowRight className="text-gray-400" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Destination Station</p>
                    <p className="text-sm text-gray-600">
                      {stations.find(s => s.id === selectedStation)?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : action === 'status' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                Seal Condition
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="condition"
                    checked={sealCondition === 'good'}
                    onChange={() => setSealCondition('good')}
                    className="text-secondary"
                  />
                  <span className="text-sm text-gray-700">Good Condition</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="condition"
                    checked={sealCondition === 'damaged'}
                    onChange={() => setSealCondition('damaged')}
                    className="text-secondary"
                  />
                  <span className="text-sm text-gray-700">Damaged</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="condition"
                    checked={sealCondition === 'repaired'}
                    onChange={() => setSealCondition('repaired')}
                    className="text-secondary"
                  />
                  <span className="text-sm text-gray-700">Repaired</span>
                </label>
              </div>
            </div>
          </div>
        ) : action === 'utilization' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                Utilization Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="utilization"
                    checked={isInUse}
                    onChange={() => setIsInUse(true)}
                    className="text-secondary"
                  />
                  <span className="text-sm text-gray-700">In Use</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="utilization"
                    checked={!isInUse}
                    onChange={() => setIsInUse(false)}
                    className="text-secondary"
                  />
                  <span className="text-sm text-gray-700">Not in Use</span>
                </label>
              </div>
            </div>
          </div>
        ) : null}

        {error && (
          <p className="text-sm text-red-600 mt-4">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          {action ? (
            <>
              <button
                type="button"
                onClick={() => setAction(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-1deg border border-gray-200"
              >
                Back
              </button>
              <button
                onClick={
                  action === 'issue' ? handleIssue :
                  action === 'status' ? handleStatusUpdate :
                  handleUtilizationUpdate
                }
                disabled={loading || (action === 'issue' && !selectedStation)}
                className="px-4 py-2 bg-secondary text-white rounded-1deg hover:bg-secondary/90 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-1deg border border-gray-200"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};