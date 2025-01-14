import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  Timestamp, 
  orderBy,
  where
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { db, auth } from './firebase';
import type { User, UserRole } from '../types/auth';

export const getUserRole = async (userId: string): Promise<string | null> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('id', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  return (snapshot.docs[0].data() as User).role;
};

const USERS_COLLECTION = 'users';

export const getUsers = async () => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
};

export const addUser = async (userData: {
  email: string;
  name: string;
  role: UserRole;
  stationId?: string;
}) => {
  try {
    // Create auth user with a random password
    const tempPassword = Math.random().toString(36).slice(-8);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      tempPassword
    );

    // Update display name
    await userCredential.user.updateProfile({
      displayName: userData.name
    });

    // Create user document
    const usersRef = collection(db, USERS_COLLECTION);
    const newUser = {
      id: userCredential.user.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      stationId: userData.stationId,
      createdAt: Timestamp.now().toDate().toISOString(),
      lastActive: Timestamp.now().toDate().toISOString(),
    };

    await addDoc(usersRef, newUser);

    // Send password reset email for user to set their own password
    await sendPasswordResetEmail(auth, userData.email);

    return newUser;
  } catch (error) {
    throw new Error(`Failed to create user: ${(error as Error).message}`);
  }
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const userRef = doc(db, USERS_COLLECTION, id);
  const updatedData = {
    ...updates,
    lastActive: Timestamp.now().toDate().toISOString(),
  };
  await updateDoc(userRef, updatedData);
  return { id, ...updatedData };
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, orderBy('name'));
  
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    callback(users);
  });
};