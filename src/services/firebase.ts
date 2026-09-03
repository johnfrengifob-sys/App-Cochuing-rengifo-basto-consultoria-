import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

// Initialize Firebase client SDK safely
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID from config if present
export const db: Firestore = config.firestoreDatabaseId
  ? getFirestore(firebaseApp, config.firestoreDatabaseId)
  : getFirestore(firebaseApp);

// Initialize Firebase Auth
export const auth: Auth = getAuth(firebaseApp);

export const FIREBASE_METADATA = {
  projectId: config.projectId,
  firestoreDatabaseId: config.firestoreDatabaseId,
  storageBucket: config.storageBucket,
  authDomain: config.authDomain,
  status: 'CONNECTED',
};
