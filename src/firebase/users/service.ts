
'use client';

import {
  doc,
  getDoc,
  setDoc,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Define the shape of our user profile data
interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  profileImageURL: string | null;
  createdAt: any; // Use 'any' for serverTimestamp
}

/**
 * Checks if a user profile exists in Firestore, and if not, creates one.
 * This function is designed to be called after a user signs in.
 *
 * @param firestore The Firestore database instance.
 * @param user The Firebase Auth User object.
 * @returns The user's profile data from Firestore or null if an error occurs.
 */
export async function getOrCreateUser(
  firestore: Firestore,
  user: User
): Promise<UserProfile | null> {
  const userRef = doc(firestore, 'users', user.uid);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // User profile already exists, return the data.
      return userSnap.data() as UserProfile;
    } else {
      // User profile doesn't exist, create it.
      const newUserProfile: UserProfile = {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        profileImageURL: user.photoURL,
        createdAt: serverTimestamp(), // Let Firestore set the creation time
      };
      
      // Use setDoc and catch potential errors for creating the document.
      await setDoc(userRef, newUserProfile)
        .catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'create',
                requestResourceData: {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                    profileImageURL: user.photoURL,
                },
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError; // Re-throw to signal failure
        });


      return newUserProfile;
    }
  } catch (error: any) {
    // This will now catch both getDoc failures and re-thrown setDoc failures
    if (error instanceof FirestorePermissionError) {
        // If it's already our custom error, just re-throw it or let it propagate
        throw error;
    }

    // If it's a generic error (e.g., from getDoc), wrap it
    const permissionError = new FirestorePermissionError({
      path: userRef.path,
      operation: 'get', 
    });

    errorEmitter.emit('permission-error', permissionError);
    return null;
  }
}

    