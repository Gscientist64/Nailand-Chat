import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Cleanly format the private key string regardless of whether it contains
 * literal newlines, escaped \n characters, carriage returns, or surrounding quotes.
 */
function cleanPrivateKey(key: string): string {
  let result = key.trim();
  // Strip enclosing quotes if present
  if (
    (result.startsWith('"') && result.endsWith('"')) ||
    (result.startsWith("'") && result.endsWith("'"))
  ) {
    result = result.slice(1, -1);
  }
  // Replace literal '\n' sequences with real newlines
  result = result.replace(/\\n/g, '\n');
  // Strip any carriage returns (\r)
  result = result.replace(/\r/g, '');
  // Ensure standard PEM line breaks around header and footer
  result = result
    .replace(/-----BEGIN PRIVATE KEY-----\s*/, '-----BEGIN PRIVATE KEY-----\n')
    .replace(/\s*-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
  return result.trim();
}

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT ||
  (process.env.FIREBASE_PROJECT_ID &&
   process.env.FIREBASE_CLIENT_EMAIL &&
   process.env.FIREBASE_PRIVATE_KEY)
);

let firebaseAdminApp: App | null = null;

function initFirebase(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // 1. Check if a full service account JSON string is provided
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    try {
      let cleanJson = serviceAccountJson.trim();
      if (
        (cleanJson.startsWith('"') && cleanJson.endsWith('"')) ||
        (cleanJson.startsWith("'") && cleanJson.endsWith("'"))
      ) {
        cleanJson = cleanJson.slice(1, -1);
      }
      const parsed = JSON.parse(cleanJson);
      firebaseAdminApp = initializeApp({ credential: cert(parsed) });
      console.log('  ✓ Firebase Admin SDK initialized from FIREBASE_SERVICE_ACCOUNT');
      return firebaseAdminApp;
    } catch (e) {
      console.error('  ✗ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
    }
  }

  // 2. Check individual environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    return null;
  }

  try {
    const privateKey = cleanPrivateKey(rawPrivateKey);
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
