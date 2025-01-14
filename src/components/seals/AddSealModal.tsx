import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Upload, Trash2 } from 'lucide-react';
import type { Seal, SealStatus } from '../../types/seal';
import type { Station } from '../../types/station';
import { addSeal, uploadSealImage, updateSeal } from '../../lib/seals';
import { subscribeToStations } from '../../lib/stations';

interface AddSealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddSealModal: React.FC<AddSealModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    serialCode: '',
    qrCode: '',
    status: 'Received' as SealStatus,
    currentStation: '',
    stationId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToStations((updatedStations) => {
      setStations(updatedStations);
    });

    return () => {
      unsubscribe();
      // Clean up camera stream if active
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    // Clean up preview URLs when component unmounts
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (err) {
      setError('Unable to access camera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;

      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(file);
      
      setImages(prev => [...prev, file]);
      setPreviewUrls(prev => [...prev, previewUrl]);
      stopCamera();
    }, 'image/jpeg');
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!formData.stationId) {
      setError('Please select a station');
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError('Please add at least one image');
      setLoading(false);
      return;
    }

    try {
      // First create the seal to get an ID
      const newSeal = await addSeal({
        ...formData,
        isUnutilized: true,
        sourceStation: formData.currentStation,
        images: []
      });

      // Upload all images
      const uploadPromises = images.map(file => 
        uploadSealImage(file, newSeal.id, 'initial')
      );
      const uploadedImages = await Promise.all(uploadPromises);

      // Update seal with image URLs
      await updateSeal(newSeal.id, {
        images: uploadedImages
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
      <div className="bg-white rounded-1deg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-alexandria font-semibold text-gray-800">Add New Seal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-1">
                Serial Code
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                value={formData.serialCode}
                onChange={(e) => setFormData(prev => ({ ...prev, serialCode: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-1">
                QR Code
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                value={formData.qrCode}
                onChange={(e) => setFormData(prev => ({ ...prev, qrCode: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
              Select Station
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
              value={formData.stationId}
              onChange={(e) => {
                const selectedStation = stations.find(s => s.id === e.target.value);
                if (selectedStation) {
                  setFormData(prev => ({
                    ...prev,
                    stationId: selectedStation.id,
                    currentStation: selectedStation.name
                  }));
                }
              }}
            >
              <option value="">Select a station</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name} - {station.location.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
              Seal Images
            </label>
            
            <div className="space-y-4">
              {/* Image Preview Grid */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-5 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-1deg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Camera Preview */}
              {isCapturing && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover rounded-1deg"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                    <button
                      type="button"
                      onClick={captureImage}
                      className="px-4 py-2 bg-secondary text-white rounded-1deg hover:bg-secondary/90"
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 bg-red-500 text-white rounded-1deg hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Image Upload Controls */}
              {!isCapturing && images.length < 5 && (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-4 py-3 border-2 border-dashed border-gray-200 rounded-1deg hover:border-secondary flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    <span className="font-alexandria">Upload Images</span>
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 px-4 py-3 border-2 border-dashed border-gray-200 rounded-1deg hover:border-secondary flex items-center justify-center gap-2"
                  >
                    <Camera size={20} />
                    <span className="font-alexandria">Take Picture</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              )}

              <p className="text-xs text-gray-500">
                Upload up to 5 images. Supported formats: JPG, PNG
              </p>
            </div>
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
              type="submit"
              disabled={loading || images.length === 0}
              className="px-4 py-2 bg-secondary text-white rounded-1deg hover:bg-secondary/90 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Seal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};