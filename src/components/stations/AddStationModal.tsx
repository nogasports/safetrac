import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Search, MapPin } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, googleMapsLibraries, defaultMapCenter } from '../../lib/googleMaps';
import { subscribeToUsers } from '../../lib/users';
import type { Station, StationType } from '../../types/station';
import type { User } from '../../types/auth';
import { addStation } from '../../lib/stations';

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

export const AddStationModal: React.FC<AddStationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'sub' as StationType,
    location: {
      latitude: defaultMapCenter.lat,
      longitude: defaultMapCenter.lng,
      address: ''
    },
    manager: {
      id: '',
      name: '',
      email: '',
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [managers, setManagers] = useState<User[]>([]);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: googleMapsLibraries
  });

  useEffect(() => {
    const unsubscribe = subscribeToUsers((updatedUsers) => {
      const availableManagers = updatedUsers.filter(user =>
        ['station-manager', 'sub-station-manager', 'main-store-manager'].includes(user.role)
      );
      setManagers(availableManagers);
    });

    return () => unsubscribe();
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  }, []);

  const handlePlacesChanged = useCallback(() => {
    if (searchBoxRef.current && mapRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        const location = place.geometry?.location;
        if (location) {
          const newLatLng = {
            latitude: location.lat(),
            longitude: location.lng()
          };
          
          setFormData(prev => ({
            ...prev,
            location: {
              ...newLatLng,
              address: place.formatted_address || ''
            }
          }));

          mapRef.current.panTo(location);
          mapRef.current.setZoom(15);
        }
      }
    }
  }, []);

  const handleMarkerDrag = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      // Reverse geocode the coordinates
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: lat,
              longitude: lng,
              address: results[0].formatted_address
            }
          }));
        }
      });
    }
  }, []);

  if (!isOpen) return null;

  const handleManagerSelect = (user: User) => {
    setFormData(prev => ({
      ...prev,
      manager: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addStation(formData);
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
      <div className="bg-white rounded-1deg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-alexandria font-semibold text-gray-800">Add New Station</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-alexandria font-medium text-gray-700 mb-1">
              Station Name
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
              Station Type
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as StationType }))}
            >
              <option value="main">Main Station</option>
              <option value="sub">Sub Station</option>
              <option value="mobile">Mobile Station</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-alexandria font-medium text-gray-700">
              Location
            </label>
            
            {isLoaded ? (
              <>
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePlacesChanged();
                      }
                    }}
                  />
                </div>

                <div className="rounded-1deg overflow-hidden border border-gray-200">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{
                      lat: formData.location.latitude,
                      lng: formData.location.longitude
                    }}
                    zoom={13}
                    onLoad={onMapLoad}
                  >
                    <Marker
                      position={{
                        lat: formData.location.latitude,
                        lng: formData.location.longitude
                      }}
                      draggable={true}
                      onDragEnd={handleMarkerDrag}
                    />
                  </GoogleMap>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>{formData.location.address || 'Drag the marker to set location'}</span>
                </div>
              </>
            ) : (
              <div className="h-[300px] bg-gray-50 rounded-1deg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-1">
                Select Manager
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                value={formData.manager.id}
                onChange={(e) => {
                  const selectedManager = managers.find(m => m.id === e.target.value);
                  if (selectedManager) {
                    handleManagerSelect(selectedManager);
                  }
                }}
              >
                <option value="">Select a manager</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-1">
                Manager Email
              </label>
              <input
                type="email"
                required
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary bg-gray-50"
                value={formData.manager.email}
                placeholder="Email will be set automatically"
              />
            </div>
          </div>

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
              {loading ? 'Adding...' : 'Add Station'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};