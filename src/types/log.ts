export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  entityId?: string;
  entityType?: 'seal' | 'station' | 'user';
}