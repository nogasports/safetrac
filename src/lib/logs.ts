import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  onSnapshot, 
  Timestamp, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import type { ActivityLog } from '../types/log';

const LOGS_COLLECTION = 'activity_logs';

export const addActivityLog = async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
  const logsRef = collection(db, LOGS_COLLECTION);
  const newLog = {
    ...log,
    timestamp: Timestamp.now().toDate().toISOString(),
  };
  const docRef = await addDoc(logsRef, newLog);
  return { id: docRef.id, ...newLog };
};

export const subscribeToLogs = (callback: (logs: ActivityLog[]) => void) => {
  const logsRef = collection(db, LOGS_COLLECTION);
  const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActivityLog[];
    callback(logs);
  });
};