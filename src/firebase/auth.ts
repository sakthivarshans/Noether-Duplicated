
'use client';

import {
  Auth,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
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
  }
  return null;
}


export async function signOut(auth: Auth) {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

    