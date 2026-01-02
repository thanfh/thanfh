import * as firebaseApp from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- HƯỚNG DẪN: ---
// 1. Vào Firebase Console -> Project Settings -> General -> Your apps
// 2. Copy thông tin trong firebaseConfig và thay thế vào bên dưới:

const firebaseConfig = {
  apiKey: "AIzaSyC-JZrio92RycE7Hios7TvUr_xRcUG9s0A",
  authDomain: "portfolio-cms-18f16.firebaseapp.com",
  projectId: "portfolio-cms-18f16",
  storageBucket: "portfolio-cms-18f16.firebasestorage.app",
  messagingSenderId: "372191394576",
  appId: "1:372191394576:web:7bd70cbd2bbd86743c4395",
  measurementId: "G-LNHCVK4PFR"
};

// Initialize Firebase (Modular SDK)
// Use wildcard import and cast to any to handle potential type definition mismatches
const app = (firebaseApp as any).initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);