import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  Timestamp, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Seal } from '../types/seal';
import { compressImage } from './imageUtils';
import { addActivityLog } from './logs';
import { auth } from './firebase';

const SEALS_COLLECTION = 'seals';

export const getSeals = async () => {
  const sealsRef = collection(db, SEALS_COLLECTION);
  const q = query(sealsRef, orderBy('lastUpdated', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Seal[];
};

export const addSeal = async (seal: Omit<Seal, 'id' | 'lastUpdated' | 'receivedDate'>) => {
  const sealsRef = collection(db, SEALS_COLLECTION);
  const now = Timestamp.now();
  const newSeal = {
    ...seal,
    receivedDate: now.toDate().toISOString(),
    lastUpdated: now.toDate().toISOString(),
  };
  
  const docRef = await addDoc(sealsRef, newSeal);
  
  // Log the activity
  const user = auth.currentUser;
  if (user) {
    await addActivityLog({
      userId: user.uid,
      userName: user.displayName || user.email || 'Unknown User',
      action: 'added a new seal',
      details: `Added seal with serial code ${seal.serialCode}`,
      entityId: docRef.id,
      entityType: 'seal'
    });
  }
  
  return { id: docRef.id, ...newSeal };
};

export const updateSeal = async (id: string, updates: Partial<Seal>) => {
  const sealRef = doc(db, SEALS_COLLECTION, id);
  const updatedData = {
    ...updates,
    lastUpdated: Timestamp.now().toDate().toISOString(),
  };
  
  await updateDoc(sealRef, updatedData);
  
  // Log the activity
  const user = auth.currentUser;
  if (user) {
    const actionDescription = updates.status ? `updated seal status to ${updates.status}` :
      updates.destinationStation ? `issued seal to ${updates.destinationStation}` :
      'updated seal details';

    await addActivityLog({
      userId: user.uid,
      userName: user.displayName || user.email || 'Unknown User',
      action: actionDescription,
      details: `Updated seal ${id}`,
      entityId: id,
      entityType: 'seal'
    });
  }
  
  return { id, ...updatedData };
};

export const subscribeToSeals = (callback: (seals: Seal[]) => void) => {
  const sealsRef = collection(db, SEALS_COLLECTION);
  const q = query(sealsRef, orderBy('lastUpdated', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const seals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Seal[];
    callback(seals);
  });
};

export const uploadSealImage = async (file: File, sealId: string, type: 'initial' | 'damage' | 'repair') => {
  const timestamp = new Date().toISOString();
  
  try {
    const base64Data = await compressImage(file);
    
    return {
      data: base64Data,
      timestamp,
      type,
      originalName: file.name
    };
  } catch (error) {
    throw new Error(`Failed to process image: ${(error as Error).message}`);
  }
};