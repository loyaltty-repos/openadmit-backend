import admin from 'firebase-admin';
import path from 'path';
import config from './config.js';

let firebaseApp;

const initializeFirebase = () => {
  if (!admin.apps.length) {
    const serviceAccountPath = path.resolve('./firebase-service-account.json');

    if (!config.firebase.FIREBASE_PROJECT_ID) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is required');
    }

    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        projectId: config.firebase.FIREBASE_PROJECT_ID,
        storageBucket: config.firebase.FIREBASE_STORAGE_BUCKET
      });

      console.log(`Firebase initialized for project: ${config.firebase.FIREBASE_PROJECT_ID}`);
    } catch (error) {
      console.error('Firebase initialization error:', error);
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid Firebase service account credentials. Check firebase-service-account.json');
      }
      throw new Error(`Firebase initialization failed: ${error.message}`);
    }
  }
  return firebaseApp;
};

const getFirestore = () => {
  if (!firebaseApp) initializeFirebase();
  return admin.firestore();
};

const getStorage = () => {
  if (!firebaseApp) initializeFirebase();
  return admin.storage();
};

const createCustomToken = async (userId, customClaims = {}) => {
  if (!firebaseApp) initializeFirebase();
  return admin.auth().createCustomToken(userId, customClaims);
};

export { initializeFirebase, getFirestore, getStorage, createCustomToken };