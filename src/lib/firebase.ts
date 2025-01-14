import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB7ktkN6E1qMwznkKJWrQ1wqM6_E3OByW8",
  authDomain: "safetracseals.firebaseapp.com",
  projectId: "safetracseals",
  storageBucket: "safetracseals.firebasestorage.app",
  messagingSenderId: "210795949467",
  appId: "1:210795949467:web:0dab51a8a3234cc29e853e",
  measurementId: "G-5RQSCDL1X1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Export app instance
export default app;