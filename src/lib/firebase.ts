import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAZlkHziB6-ae9xaEt0LblLCQV8m0am83Q",
  authDomain: "viettrekking.firebaseapp.com",
  projectId: "viettrekking",
  storageBucket: "viettrekking.firebasestorage.app",
  messagingSenderId: "977114476626",
  appId: "1:977114476626:web:1937aaabe5e522b5c86f8b",
  measurementId: "G-833E2BXP20"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
