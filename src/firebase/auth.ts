
'use client';

import {
  Auth,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getOrCreateUser } from '@/firebase/users/service';
import { getFirestore } from 'firebase/firestore';

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    if (result && result.user) {
      const user = result.user;
      const firestore = getFirestore(auth.app);
      await getOrCreateUser(firestore, user);
      return user;
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    // Fallback to anonymous sign-in
    if (
      (error as any).code === 'auth/popup-closed-by-user' ||
      (error as any).code === 'auth/cancelled-popup-request'
    ) {
      return null;
    }
    throw error;
  }
  return null;
}

export async function signUpWithEmail(
  auth: Auth,
  email: string,
  password: string,
  displayName: string
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await updateProfile(userCredential.user, { displayName });

  const firestore = getFirestore(auth.app);
  // Re-fetch user to get the updated profile
  const user = auth.currentUser;
  if (user) {
    await getOrCreateUser(firestore, user);
  }

  return userCredential.user;
}

export async function signInWithEmail(
  auth: Auth,
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(auth: Auth) {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
