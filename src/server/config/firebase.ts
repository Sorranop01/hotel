import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

// Firebase Admin configuration
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin (singleton pattern)
let app: App;
let auth: Auth;
let db: Firestore;
let storage: Storage;

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // Check if running with emulator
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.log('🔥 Using Firebase Emulator');
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-staylock',
      });
    } else {
      // Production mode with service account
      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        console.warn('⚠️ Firebase credentials not fully configured');
      }

      app = initializeApp({
        credential: cert(serviceAccount as Parameters<typeof cert>[0]),
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
      });
    }
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Firestore settings
  db.settings({
    ignoreUndefinedProperties: true,
  });

  return { app, auth, db, storage };
}

// Initialize on import
const firebaseAdmin = initializeFirebaseAdmin();

export { firebaseAdmin, app, auth, db, storage };
export default firebaseAdmin;
