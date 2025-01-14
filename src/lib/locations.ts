import { collection, query, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { Location } from '../types/location';

const LOCATIONS_COLLECTION = 'locations';

export const getLocations = async () => {
  const locationsRef = collection(db, LOCATIONS_COLLECTION);
  const snapshot = await getDocs(locationsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Location[];
};

export const subscribeToLocations = (callback: (locations: Location[]) => void) => {
  const locationsRef = collection(db, LOCATIONS_COLLECTION);
  return onSnapshot(locationsRef, (snapshot) => {
    const locations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Location[];
    callback(locations);
  });
};
