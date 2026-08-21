import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Cleanly format the private key string regardless of whether it contains
 * literal newlines, escaped \n characters, carriage returns, surrounding quotes,
 * or even if the BEGIN/END headers are missing or malformed.
 */
function cleanPrivateKey(raw: string): string {
  let str = raw.trim();

  // Strip wrapping quotes
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1);
  }

  // Handle double or single escaped newlines and carriage returns
  str = str.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r/g, '');

  // If standard BEGIN header is missing, extract base64 chars and build standard PEM lines
  if (!str.includes('-----BEGIN PRIVATE KEY-----')) {
    const cleanB64 = str.replace(/[^A-Za-z0-9+/=]/g, '');
    const lines = cleanB64.match(/.{1,64}/g) || [cleanB64];
    return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;
  }

  // If header exists, extract the inner base64 payload and ensure clean 64-char lines
  const match = str.match(/-----BEGIN [A-Z ]+-----(.*?)-----END [A-Z ]+-----/s);
  if (match && match[1]) {
    const innerB64 = match[1].replace(/[^A-Za-z0-9+/=]/g, '');
    const lines = innerB64.match(/.{1,64}/g) || [innerB64];
    return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;
  }

  return str;
}

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT ||
  (process.env.FIREBASE_PROJECT_ID &&
   process.env.FIREBASE_CLIENT_EMAIL &&
   process.env.FIREBASE_PRIVATE_KEY)
);

export let lastInitError: string | null = null;
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
      lastInitError = null;
      return firebaseAdminApp;
    } catch (e: any) {
      console.error('  ✗ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
      lastInitError = `FIREBASE_SERVICE_ACCOUNT error: ${e?.message || e}`;
    }
  }

  // 2. Check individual environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    lastInitError = `Missing env vars: projectId=${!!projectId}, clientEmail=${!!clientEmail}, privateKey=${!!rawPrivateKey}`;
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
    lastInitError = null;
    return firebaseAdminApp;
  } catch (e: any) {
    console.error('  ✗ Failed to initialize Firebase Admin SDK:', e);
    lastInitError = `cert() error: ${e?.message || e}`;
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
