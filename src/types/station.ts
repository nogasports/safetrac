export type StationType = 'main' | 'sub' | 'mobile';

export interface Station {
  id: string;
  name: string;
  type: StationType;
  locationId: string; // Reference to location document
  manager: {
    id: string;
    name: string;
    email: string;
  };
  activeSeals: number;
  totalSeals: number;
  status: 'active' | 'inactive';
  lastActive: string;
}