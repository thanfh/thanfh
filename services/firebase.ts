import * as firebaseApp from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- HƯỚNG DẪN: ---
// 1. Vào Firebase Console -> Project Settings -> General -> Your apps
// 2. Copy thông tin trong firebaseConfig và thay thế vào bên dưới:

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (Modular SDK)
// Use wildcard import and cast to any to handle potential type definition mismatches
const app = (firebaseApp as any).initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);