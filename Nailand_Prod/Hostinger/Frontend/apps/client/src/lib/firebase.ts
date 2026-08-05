import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Declare the google property on window
declare global {
  interface Window {
    google: any;
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyBLbOlwCJPaD9XKZsKjtFtmJwfUe3fj3Yg",
  authDomain: "nailand002.firebaseapp.com",
  projectId: "nailand002",
  storageBucket: "nailand002.firebasestorage.app",
  messagingSenderId: "458533723418",
  appId: "1:458533723418:web:563973b54b4d679e3020a3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// REPLACE THIS WITH YOUR NEW OAuth CLIENT ID from step 2
const GOOGLE_OAUTH_CLIENT_ID = "458533723418-ksbj39h35nvm0v3tqv0ech9euu4ref76.apps.googleusercontent.com";

export const initializeGoogleOneTap = (callback: (credential: string) => void) => {
  // Check if already initialized
  if (window.google?.accounts?.id) {
    console.log('Google One Tap already initialized');
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    console.log('Google One Tap script loaded, initializing with client ID:', GOOGLE_OAUTH_CLIENT_ID);
    
    window.google.accounts.id.initialize({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      callback: (response: any) => {
        console.log('Google One Tap callback received');
        callback(response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  };
  script.onerror = () => {
    console.error('Failed to load Google One Tap script');
  };
  document.body.appendChild(script);
};

export const promptGoogleOneTap = () => {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt();
    console.log('Google One Tap prompted');
  } else {
    console.log('Google One Tap not ready yet, waiting...');
    // Retry after a short delay
    setTimeout(() => promptGoogleOneTap(), 500);
  }
};