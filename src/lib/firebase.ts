// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (only if config is present — otherwise Google sign-in is disabled)
const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app: any = null;
export let auth: any = null;
export const googleProvider = new GoogleAuthProvider();

if (hasFirebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Configure Google provider
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

// Function to get Google ID token via Firebase popup
export const getGoogleIdToken = async (): Promise<string> => {
  if (!auth) {
    throw new Error('Firebase is not configured. Set the VITE_FIREBASE_* environment variables.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const isFirebaseConfigured = hasFirebaseConfig;
