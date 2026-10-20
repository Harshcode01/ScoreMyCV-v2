import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBdx9tDnY_Mvj4qrn0reagC5-BL6MyPCj4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mernai-a888a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mernai-a888a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mernai-a888a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "724267821616",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:724267821616:web:48bbc7e0909a8f4ec45bf5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K2PYP99EMR",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
