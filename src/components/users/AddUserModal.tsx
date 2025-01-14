import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { UserRole } from '../../types/auth';
import { addUser } from '../../lib/users';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'station-manager' as UserRole,
    stationId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addUser(formData);
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
          <h2 className="text-xl font-alexandria font-semibold text-gray-800">Add New User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-alexandria font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-alexandria font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-alexandria font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
            >
              <option value="admin">Admin</option>
              <option value="main-store-manager">Main Store Manager</option>
              <option value="station-manager">Station Manager</option>
              <option value="sub-station-manager">Sub-Station Manager</option>
            </select>
          </div>

          {(formData.role === 'station-manager' || formData.role === 'sub-station-manager') && (
            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-1">
                Station ID
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                value={formData.stationId}
                onChange={(e) => setFormData(prev => ({ ...prev, stationId: e.target.value }))}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-1deg border border-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-secondary text-white rounded-1deg hover:bg-secondary/90 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};