import React, { useState, useEffect } from 'react';
import { Package, Send, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { subscribeToSeals } from '../../lib/seals';
import type { Seal } from '../../types/seal';

export const SubStationDashboardPage = () => {
  const [seals, setSeals] = useState<Seal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToSeals((updatedSeals) => {
      setSeals(updatedSeals);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = {
    totalSeals: seals.length,
    inTransit: seals.filter(s => s.status === 'In Transit').length,
    deployed: seals.filter(s => s.status === 'Deployed').length,
    damaged: seals.filter(s => s.status === 'Damaged').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-alexandria font-semibold text-gray-800">
          Sub-Station Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-1deg">
                <Package className="text-secondary" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Seals</p>
                <p className="text-xl font-alexandria font-semibold text-gray-800">
                  {stats.totalSeals}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-500">
              <ArrowUpRight size={16} />
              <span className="text-sm">12%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-1deg">
                <Send className="text-blue-500" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Deployed</p>
                <p className="text-xl font-alexandria font-semibold text-gray-800">
                  {stats.deployed}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-500">
              <ArrowUpRight size={16} />
              <span className="text-sm">8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-1deg">
                <Clock className="text-orange-500" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-xl font-alexandria font-semibold text-gray-800">
                  {stats.inTransit}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <ArrowDownRight size={16} />
              <span className="text-sm">5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-1deg">
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Damaged</p>
                <p className="text-xl font-alexandria font-semibold text-gray-800">
                  {stats.damaged}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <ArrowUpRight size={16} />
              <span className="text-sm">2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Deployments */}
      <div className="bg-white rounded-1deg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-alexandria font-semibold text-gray-800">Active Deployments</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : seals.filter(s => s.status === 'Deployed').length === 0 ? (
            <div className="text-center py-8 text-gray-500">No active deployments</div>
          ) : (
            <div className="space-y-4">
              {seals
                .filter(s => s.status === 'Deployed')
                .map(seal => (
                  <div key={seal.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Package size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Seal {seal.serialCode}
                        </p>
                        <p className="text-xs text-gray-500">
                          Deployed: {new Date(seal.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        {seal.destinationStation}
                      </p>
                      <p className="text-xs text-gray-500">
                        {seal.daysInTransit} days in transit
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Damaged Seals */}
      <div className="bg-white rounded-1deg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-alexandria font-semibold text-gray-800">Recent Damaged Seals</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : seals.filter(s => s.status === 'Damaged').length === 0 ? (
            <div className="text-center py-8 text-gray-500">No damaged seals</div>
          ) : (
            <div className="space-y-4">
              {seals
                .filter(s => s.status === 'Damaged')
                .slice(0, 5)
                .map(seal => (
                  <div key={seal.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={20} className="text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Seal {seal.serialCode}
                        </p>
                        <p className="text-xs text-gray-500">
                          Reported: {new Date(seal.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-1deg text-xs font-medium bg-red-100 text-red-800">
                      Damaged
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};