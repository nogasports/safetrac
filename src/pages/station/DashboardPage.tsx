import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Send, AlertTriangle, ArrowUpRight, 
  ArrowDownRight, TrendingUp, Clock, Shield,
  Truck, AlertCircle, CheckCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subscribeToSeals } from '../../lib/seals';
import type { Seal } from '../../types/seal';

// Reusable StatCard Component
const StatCard = ({ icon, label, value, trend, trendIcon, trendColor }) => (
  <div className="bg-white p-4 rounded-1deg border border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-secondary/10 rounded-1deg">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xl font-alexandria font-semibold text-gray-800">
            {value}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1" style={{ color: trendColor }}>
        {trendIcon}
        <span className="text-sm">{trend}</span>
      </div>
    </div>
  </div>
);

// Reusable QuickAction Component
const QuickAction = ({ icon, label, action }) => (
  <a
    href={action}
    className="flex items-center gap-3 p-4 bg-white rounded-1deg border border-gray-200 hover:border-secondary transition-colors"
  >
    <div className="p-2 bg-secondary/10 rounded-1deg text-secondary">
      {icon}
    </div>
    <span className="font-medium">{action.label}</span>
  </a>
);

// Reusable Chart Component
const SealMovementChart = ({ data }) => (
  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="lastUpdated" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="status" stroke="#0694a2" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const StatusDistributionChart = ({ data }) => (
  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#0694a2" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const StationDashboardPage = () => {
  const [seals, setSeals] = useState<Seal[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    const unsubscribe = subscribeToSeals((updatedSeals) => {
      setSeals(updatedSeals);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => ({
    totalSeals: seals.length,
    availableSeals: seals.filter(s => s.status === 'Received').length,
    inTransit: seals.filter(s => s.status === 'In Transit').length,
    damaged: seals.filter(s => s.status === 'Damaged').length,
    utilization: Math.round((seals.filter(s => s.status !== 'Available').length / seals.length) * 100),
    efficiency: 94,
  }), [seals]);

  const quickActions = useMemo(() => [
    { icon: <Package />, label: 'Add New Seal', action: '/seals/add' },
    { icon: <Send />, label: 'Dispatch Seals', action: '/seals/dispatch' },
    { icon: <Shield />, label: 'Security Check', action: '/security' },
    { icon: <AlertCircle />, label: 'Report Issue', action: '/reports/new' },
  ], []);

  const recentActivity = useMemo(() => seals.slice(0, 5), [seals]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-alexandria font-semibold text-gray-800">
            Station Dashboard
          </h1>
          <p className="text-gray-500">Welcome back, Station Manager</p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t as any)}
              className={`px-3 py-1 rounded-1deg text-sm ${
                timeframe === t ? 'bg-secondary text-white' : 'bg-gray-100'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <QuickAction key={i} {...action} />
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="text-secondary" size={20} />}
          label="Total Seals"
          value={stats.totalSeals}
          trend="12%"
          trendIcon={<ArrowUpRight size={16} />}
          trendColor="#10B981"
        />
        <StatCard
          icon={<Package className="text-green-500" size={20} />}
          label="Available Seals"
          value={stats.availableSeals}
          trend="8%"
          trendIcon={<ArrowUpRight size={16} />}
          trendColor="#10B981"
        />
        <StatCard
          icon={<Send className="text-orange-500" size={20} />}
          label="In Transit"
          value={stats.inTransit}
          trend="5%"
          trendIcon={<ArrowDownRight size={16} />}
          trendColor="#EF4444"
        />
        <StatCard
          icon={<AlertTriangle className="text-red-500" size={20} />}
          label="Damaged Seals"
          value={stats.damaged}
          trend="2%"
          trendIcon={<ArrowUpRight size={16} />}
          trendColor="#EF4444"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <h3 className="font-alexandria font-semibold mb-4">Seal Movement Trends</h3>
          <SealMovementChart data={seals} />
        </div>
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <h3 className="font-alexandria font-semibold mb-4">Status Distribution</h3>
          <StatusDistributionChart data={seals} />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <h3 className="font-alexandria font-semibold mb-4">Efficiency Score</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              {/* Add circular progress indicator here */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-secondary">{stats.efficiency}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-1deg border border-gray-200 col-span-2">
          <h3 className="font-alexandria font-semibold mb-4">Recent Alerts</h3>
          {/* Add alerts list here */}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-1deg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-alexandria font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No recent activity</div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map(seal => (
                <div key={seal.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Seal {seal.serialCode}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(seal.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-1deg text-xs font-medium
                    ${seal.status === 'Received' ? 'bg-green-100 text-green-800' : 
                      seal.status === 'In Transit' ? 'bg-orange-100 text-orange-800' :
                      seal.status === 'Damaged' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {seal.status}
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