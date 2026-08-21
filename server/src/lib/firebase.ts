import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Cleanly format the private key string regardless of whether it contains
 * literal newlines, escaped \n characters, or surrounding quotes.
 */
function normalizePrivateKey(key: string): string {
  let cleanKey = key.trim();
  if (
    (cleanKey.startsWith('"') && cleanKey.endsWith('"')) ||
    (cleanKey.startsWith("'") && cleanKey.endsWith("'"))
  ) {
    cleanKey = cleanKey.slice(1, -1);
  }
  // Replace escaped \n with actual newlines if not already converted
  cleanKey = cleanKey.replace(/\\n/g, '\n');
  return cleanKey;
}

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

let firebaseAdminApp: App | null = null;

function initFirebase(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    return null;
  }

  try {
    const privateKey = normalizePrivateKey(rawPrivateKey);
    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('  ✓ Firebase Admin SDK successfully initialized');
    return firebaseAdminApp;
  } catch (e) {
    console.error('  ✗ Failed to initialize Firebase Admin SDK:', e);
    return null;
  }
}

// Initial attempt at boot
initFirebase();

export function getFirebaseAuth(): Auth | null {
  const app = initFirebase();
  if (!app) {
    return null;
  }
  return getAuth(app);
}

export default getFirebaseAuth;
