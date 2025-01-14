import { collection, query, getDocs, addDoc, updateDoc, doc, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { Station } from '../types/station';

const STATIONS_COLLECTION = 'stations';

export const getStations = async () => {
  const stationsRef = collection(db, STATIONS_COLLECTION);
  const q = query(stationsRef, orderBy('lastActive', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Station[];
};

export const addStation = async (station: Omit<Station, 'id' | 'lastActive'>) => {
  const stationsRef = collection(db, STATIONS_COLLECTION);
  const now = Timestamp.now();
  const newStation = {
    ...station,
    lastActive: now.toDate().toISOString(),
    activeSeals: 0,
    totalSeals: 0,
    status: 'active'
  };
  const docRef = await addDoc(stationsRef, newStation);
  return { id: docRef.id, ...newStation };
};

export const updateStation = async (id: string, updates: Partial<Station>) => {
  const stationRef = doc(db, STATIONS_COLLECTION, id);
  const updatedData = {
    ...updates,
    lastActive: Timestamp.now().toDate().toISOString(),
  };
  await updateDoc(stationRef, updatedData);
  return { id, ...updatedData };
};

export const subscribeToStations = (callback: (stations: Station[]) => void) => {
  const stationsRef = collection(db, STATIONS_COLLECTION);
  const q = query(stationsRef, orderBy('lastActive', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const stations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Station[];
    callback(stations);
  });
};