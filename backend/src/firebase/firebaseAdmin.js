import admin from 'firebase-admin';
import 'dotenv/config';

// Ensure required environment variables are present
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error("Firebase Admin SDK environment variables are not set. Please check your .env file.");
  process.exit(1);
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // The private key from .env might have escaped newlines; this replaces them.
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    console.error("Firebase Admin SDK initialization error:", error);
  }
}


export default admin;
