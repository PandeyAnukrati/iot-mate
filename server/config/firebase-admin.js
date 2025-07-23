import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin with service account key file
try {
  // Path to the service account key file
  const serviceAccountPath = path.join(__dirname, 'firebase-key.json');
  
  // Initialize the app with the service account key file
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
  
  console.log('✅ Firebase Admin initialized with service account key');
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error);
  
  // Fallback to environment variables if service account key file fails
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    console.log('✅ Firebase Admin initialized with environment variables');
  } catch (fallbackError) {
    console.error('❌ Firebase Admin fallback initialization error:', fallbackError);
  }
}

export default admin;