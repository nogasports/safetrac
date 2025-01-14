import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import {
  Package,
  MapPin,
  Users,
  AlertTriangle,
  Activity,
  Send,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { subscribeToSeals } from '../../lib/seals';
import { subscribeToStations } from '../../lib/stations';
import { subscribeToUsers } from '../../lib/users';
import { GOOGLE_MAPS_API_KEY, googleMapsLibraries, defaultMapCenter } from '../../lib/googleMaps';
import type { Seal } from '../../types/seal';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

const StationMap = ({ stations }: { stations: Station[] }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: googleMapsLibraries
  });

  if (!isLoaded) {
    return (
      <div className="h-[300px] bg-gray-50 rounded-1deg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultMapCenter}
      zoom={7}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={{
            lat: station.location.latitude,
            lng: station.location.longitude
          }}
        />
      ))}
    </GoogleMap>
  );
};

export const DashboardPage = () => {
  const [seals, setSeals] = useState<Seal[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeSeals = subscribeToSeals(setSeals);
    const unsubscribeStations = subscribeToStations(setStations);
    const unsubscribeUsers = subscribeToUsers(setUsers);

    return () => {
      unsubscribeSeals();
      unsubscribeStations();
      unsubscribeUsers();
    };
  }, []);

  // Calculate statistics
  const stats = {
    totalSeals: seals.length,
    activeSeals: seals.filter(s => !s.isUnutilized).length,
    totalStations: stations.length,
    activeStations: stations.filter(s => s.status === 'active').length,
    totalUsers: users.length,
    damagedSeals: seals.filter(s => s.status === 'Damaged').length,
    inTransitSeals: seals.filter(s => s.status === 'In Transit').length,
  };

  // Get current time
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Prepare chart data
  const sealStatusData = {
    labels: ['Received', 'Issued', 'In Transit', 'Damaged', 'Repaired'],
    datasets: [{
      data: [
        seals.filter(s => s.status === 'Received').length,
        seals.filter(s => s.status === 'Issued').length,
        seals.filter(s => s.status === 'In Transit').length,
        seals.filter(s => s.status === 'Damaged').length,
        seals.filter(s => s.status === 'Repaired').length,
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.2)',
        'rgba(59, 130, 246, 0.2)',
        'rgba(249, 115, 22, 0.2)',
        'rgba(239, 68, 68, 0.2)',
        'rgba(168, 85, 247, 0.2)',
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(249, 115, 22)',
        'rgb(239, 68, 68)',
        'rgb(168, 85, 247)',
      ],
      borderWidth: 1
    }]
  };

  // Get last 7 days for timeline
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }).reverse();

  const activityData = {
    labels: last7Days,
    datasets: [{
      label: 'Seal Movements',
      data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50)),
      borderColor: 'rgb(34, 63, 127)',
      backgroundColor: 'rgba(34, 63, 127, 0.5)',
      tension: 0.4
    }]
  };

  const stationActivityData = {
    labels: stations.slice(0, 5).map(s => s.name),
    datasets: [{
      label: 'Active Seals',
      data: stations.slice(0, 5).map(s => s.activeSeals),
      backgroundColor: 'rgba(34, 63, 127, 0.5)',
    }]
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-alexandria font-semibold text-gray-800">
            Welcome Back, Admin
          </h1>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Clock size={16} />
            {timeString} · {dateString}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
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
                <MapPin className="text-blue-500" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Stations</p>
                <p className="text-xl font-alexandria font-semibold text-gray-800">
                  {stats.activeStations}
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
                <Send className="text-orange-500" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-xl font-alexandria font-semibold text-gray-800">
                  {stats.inTransitSeals}
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
                <p className="text-sm text-gray-600">Damaged Seals</p>
                <p className="text-xl font-alexandria font-semibold text-gray-800">
                  {stats.damagedSeals}
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

      {/* Charts and Maps Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Activity Timeline */}
        <div className="col-span-8 bg-white p-4 rounded-1deg border border-gray-200">
          <h3 className="font-alexandria font-semibold text-gray-800 mb-4">
            Activity Timeline
          </h3>
          <Line
            data={activityData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>

        {/* Seal Status Distribution */}
        <div className="col-span-4 bg-white p-4 rounded-1deg border border-gray-200">
          <h3 className="font-alexandria font-semibold text-gray-800 mb-4">
            Seal Status Distribution
          </h3>
          <Doughnut
            data={sealStatusData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        </div>
      </div>

      {/* Map and Station Activity */}
      <div className="grid grid-cols-12 gap-4">
        {/* Station Map */}
        <div className="col-span-7 bg-white p-4 rounded-1deg border border-gray-200">
          <h3 className="font-alexandria font-semibold text-gray-800 mb-4">
            Station Locations
          </h3>
          <StationMap stations={stations} />
        </div>

        {/* Station Activity */}
        <div className="col-span-5 bg-white p-4 rounded-1deg border border-gray-200">
          <h3 className="font-alexandria font-semibold text-gray-800 mb-4">
            Top Station Activity
          </h3>
          <Bar
            data={stationActivityData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};