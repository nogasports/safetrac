export type SealStatus = 'Received' | 'Issued' | 'In Transit' | 'Damaged' | 'Repaired';

export interface Seal {
  id: string;
  serialCode: string;
  qrCode: string;
  status: SealStatus;
  sourceStation?: string;
  destinationStation?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
  };
  currentStation?: string;
  issuedTo?: {
    name: string;
    id: string;
    timestamp: string;
  };
  receivedDate: string;
  lastUpdated: string;
  daysInTransit?: number;
  isUnutilized: boolean;
  images: {
    data: string; // base64 image data
    timestamp: string;
    type: 'initial' | 'damage' | 'repair';
    originalName: string;
  }[];
}