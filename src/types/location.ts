export interface Location {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  region: string;
  type: 'office' | 'warehouse' | 'checkpoint';
  status: 'active' | 'inactive';
}
