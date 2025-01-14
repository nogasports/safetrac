import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Search, Plus, MapPin, Filter, Users, Package, Activity } from 'lucide-react';
import { subscribeToStations } from '../../lib/stations';
import { AddStationModal } from '../../components/stations/AddStationModal';
import { GOOGLE_MAPS_API_KEY, googleMapsLibraries, defaultMapCenter } from '../../lib/googleMaps';
import type { Station } from '../../types/station';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const MapComponent = ({ stations, selectedStation, onMarkerClick, onInfoWindowClose }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: googleMapsLibraries
  });

  if (loadError) {
    return (
      <div className="h-[400px] bg-gray-50 rounded-1deg flex items-center justify-center">
        <div className="text-center p-4">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Unable to load map. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[400px] bg-gray-50 rounded-1deg flex items-center justify-center">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
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
          onClick={() => onMarkerClick(station)}
        />
      ))}
      {selectedStation && (
        <InfoWindow
          position={{
            lat: selectedStation.location.latitude,
            lng: selectedStation.location.longitude
          }}
          onCloseClick={onInfoWindowClose}
        >
          <div className="p-4 min-w-[300px]">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="text-secondary" size={20} />
              <h3 className="font-alexandria font-semibold text-gray-800">{selectedStation.name}</h3>
            </div>
            
            <div className="space-y-4">
              {/* Location Info */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Location</h4>
                <p className="text-sm text-gray-600">{selectedStation.location.address}</p>
              </div>

              {/* Manager Info */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Station Manager</h4>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Users size={16} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{selectedStation.manager.name}</p>
                    <p className="text-xs text-gray-500">{selectedStation.manager.email}</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-1deg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Active Seals</h4>
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-secondary" />
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedStation.activeSeals}
                      <span className="text-xs text-gray-500 ml-1">/ {selectedStation.totalSeals}</span>
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-1deg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Status</h4>
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-green-500" />
                    <span className={`text-sm font-medium capitalize
                      ${selectedStation.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedStation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Last Active */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Last Active</h4>
                <p className="text-sm text-gray-600">
                  {new Date(selectedStation.lastActive).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};
export const StationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToStations((updatedStations) => {
      setStations(updatedStations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredStations = stations.filter(station => {
    const searchLower = searchTerm.toLowerCase();
    return (
      station.name.toLowerCase().includes(searchLower) ||
      station.manager.name.toLowerCase().includes(searchLower) ||
      station.location.address.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: stations.length,
    active: stations.filter(s => s.status === 'active').length,
    activeSeals: stations.reduce((acc, s) => acc + s.activeSeals, 0),
    managers: new Set(stations.map(s => s.manager.id)).size
  };

  const handleMarkerClick = useCallback((station: Station) => {
    setSelectedStation(station);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-alexandria font-semibold text-gray-800">
          Stations Management
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-secondary text-white px-4 py-2 rounded-1deg flex items-center gap-2 hover:bg-secondary/90"
        >
          <Plus size={20} />
          Add New Station
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="text-secondary" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Total Stations</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-green-500" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Active Stations</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-green-500">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-blue-500" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Active Seals</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-blue-500">{stats.activeSeals}</p>
        </div>
        <div className="bg-white p-4 rounded-1deg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-purple-500" size={20} />
            <h3 className="font-alexandria font-medium text-gray-600">Station Managers</h3>
          </div>
          <p className="text-2xl font-alexandria font-semibold text-purple-500">{stats.managers}</p>
        </div>
      </div>

      <div className="bg-white rounded-1deg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by station name, manager, or location"
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

        <div className="p-4">
          <MapComponent
            stations={filteredStations}
            selectedStation={selectedStation}
            onMarkerClick={handleMarkerClick}
            onInfoWindowClose={() => setSelectedStation(null)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Station Name</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Manager</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Location</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Active Seals</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-alexandria font-semibold text-gray-600">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading stations...
                  </td>
                </tr>
              ) : filteredStations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No stations found
                  </td>
                </tr>
              ) : filteredStations.map((station) => (
                <tr key={station.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-secondary" />
                      <span className="text-sm font-medium text-gray-800">{station.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{station.type}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">{station.manager.name}</p>
                      <p className="text-gray-500">{station.manager.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{station.location.address}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">{station.activeSeals}</p>
                      <p className="text-gray-500">of {station.totalSeals}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-1deg text-xs font-medium
                      ${station.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {station.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(station.lastActive).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <AddStationModal
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