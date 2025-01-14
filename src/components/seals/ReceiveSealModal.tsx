import React, { useState } from 'react';
import { X, Package, Camera, Upload } from 'lucide-react';
import { updateSeal } from '../../lib/seals';
import type { Seal } from '../../types/seal';

interface ReceiveSealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  seal: Seal;
}

export const ReceiveSealModal: React.FC<ReceiveSealModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  seal 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleReceive = async () => {
    setLoading(true);
    setError(null);

    try {
      await updateSeal(seal.id, {
        status: 'Received',
        lastUpdated: new Date().toISOString(),
        notes: notes || undefined
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
            Receive Seal
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-1deg">
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-secondary" size={20} />
              <h3 className="font-alexandria font-medium text-gray-800">
                Seal Details
              </h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Serial Code:</span> {seal.serialCode}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Source Station:</span> {seal.sourceStation}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Current Status:</span> {seal.status}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
              Reception Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
              placeholder="Add any notes about the seal's condition or reception"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-1deg border border-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleReceive}
              disabled={loading}
              className="px-4 py-2 bg-secondary text-white rounded-1deg hover:bg-secondary/90 disabled:opacity-50"
            >
              {loading ? 'Receiving...' : 'Confirm Reception'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};