import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const initializeFirebaseAdmin = async () => {
  try {
    // Read the service account key file
    const serviceAccountPath = path.join(__dirname, 'firebase-key.json');
    const serviceAccountJson = await readFile(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize the app
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('Firebase Admin initialized successfully');
    return admin;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
};

export default initializeFirebaseAdmin;