import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, UserCog } from 'lucide-react';
import { subscribeToUsers } from '../../lib/users';
import { AddUserModal } from '../../components/users/AddUserModal';
import type { User } from '../../types/auth';

export const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role.includes('manager')).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-alexandria font-semibold text-gray-800">
          User Management
        </h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-secondary text-white px-4 py-2 rounded-1deg flex items-center gap-2 hover:bg-secondary/90"
        >
          <Plus size={20} />
          Add New User
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <UserCog className="text-secondary" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Total Users</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <UserCog className="text-purple-500" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Admins</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-purple-500">{stats.admins}</p>
        </div>
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <UserCog className="text-blue-500" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Managers</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-blue-500">{stats.managers}</p>
        </div>
      </div>

      <div className="bg-white rounded-1deg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or role"
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
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Station</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Last Active</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UserCog size={16} className="text-secondary" />
                      <span className="text-sm font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-1deg text-xs font-medium
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role.includes('manager') ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {user.role.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.stationId || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.lastActive).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-secondary hover:text-secondary/80">
                      <UserCog size={20} />
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
              Showing <span className="font-medium">{filteredUsers.length}</span> of{' '}
              <span className="font-medium">{users.length}</span> users
            </p>
          </div>
        </div>
      </div>
      
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          // Refresh will happen automatically via subscription
        }}
      />
    </div>
  );
};