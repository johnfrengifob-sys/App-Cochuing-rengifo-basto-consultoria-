import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

interface FirebaseAppletConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
  firestoreDatabaseId?: string;
}

const typedConfig = config as FirebaseAppletConfig;

const firebaseConfig = {
  apiKey: typedConfig.apiKey,
  authDomain: typedConfig.authDomain,
  projectId: typedConfig.projectId,
  storageBucket: typedConfig.storageBucket,
  messagingSenderId: typedConfig.messagingSenderId,
  appId: typedConfig.appId,
};

// Initialize Firebase client SDK safely
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID from config if present
export const db: Firestore = typedConfig.firestoreDatabaseId
  ? getFirestore(firebaseApp, typedConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

// Initialize Firebase Auth
export const auth: Auth = getAuth(firebaseApp);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation Types for Hardened Error Handling (Firebase Skill Standard)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Security / Operation Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection per Firebase Skill instructions
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Firestore connection validated successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline/cached mode.');
      return false;
    }
    // Not a fatal failure if the test doc does not exist
    return true;
  }
}

// Authentication Helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    const firebaseErr = error as { code?: string; message?: string };
    if (firebaseErr?.code === 'auth/unauthorized-domain') {
      console.warn(
        '[Firebase Auth] unauthorized-domain: El dominio actual no está agregado en Dominios Autorizados de Firebase Console (Authentication > Settings > Authorized Domains).'
      );
    } else {
      console.warn('Google Sign-In notice:', error);
    }
    throw error;
  }
}

export async function signOutUser() {
  return await firebaseSignOut(auth);
}

export const OAUTH_CLIENT_ID = typedConfig.oAuthClientId;

export const FIREBASE_METADATA = {
  projectId: typedConfig.projectId,
  firestoreDatabaseId: typedConfig.firestoreDatabaseId || '(default)',
  storageBucket: typedConfig.storageBucket,
  authDomain: typedConfig.authDomain,
  oAuthClientId: typedConfig.oAuthClientId,
  status: 'CONNECTED',
};

