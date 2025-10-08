
'use client';

// This file is effectively a no-op now since Firebase is not being used.
// It's kept to prevent import errors in other files that might still reference it.
// In a real scenario, you would remove these exports and the files that use them.

const useFirebase = () => ({});
const useAuth = () => ({});
const useFirestore = () => ({});
const useFirebaseApp = () => ({});
const useUser = () => ({ user: null, isUserLoading: false });
const useMemoFirebase = <T>(factory: () => T, deps: any[]) => factory();


export {
    useFirebase,
    useAuth,
    useFirestore,
    useFirebaseApp,
    useUser,
    useMemoFirebase,
}

export * from './firestore/use-collection';
export * from './firestore/use-doc';
