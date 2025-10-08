
'use client';

import { Button } from '@/components/ui/button';
import Mascot from '@/components/mascot';
import { useRouter } from 'next/navigation';
import { User, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { signInWithGoogle, signOut } from '@/firebase/auth';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';


export default function LandingPage() {
  const router = useRouter();
  const { auth } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
      
  }, [auth, router]);


  const handleSignIn = async () => {
    if (auth) {
      setIsLoading(true);
      try {
        const userCredential = await signInWithGoogle(auth);
        if (!userCredential) {
           // If sign-in fails, fall back to anonymous
           await signInAnonymously(auth);
        }
        // The onAuthStateChanged listener will handle the redirect.
      } catch (error) {
        console.error("Sign-in failed, falling back to anonymous:", error);
        try {
          await signInAnonymously(auth);
        } catch (anonError) {
          console.error("Anonymous sign-in also failed:", anonError);
          setIsLoading(false);
        }
      }
    }
  };

  const handleSignOut = async () => {
    if(auth) {
      await signOut(auth);
      setUser(null); // Explicitly set user to null on sign out
      router.push('/');
    }
  };


  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-br from-background via-secondary to-accent">
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10"><Mascot /></div>
            <h1 className="font-brand text-4xl text-primary">
              Noether
            </h1>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" /> Profile
              </Link>
            </Button>
            {user ? (
              <Button onClick={handleSignOut} disabled={isLoading}>
                <LogOut className="mr-2 h-4 w-4" />
                {isLoading ? 'Loading...' : 'Sign Out'}
              </Button>
            ) : (
              <Button onClick={handleSignIn} disabled={isLoading}>
                 <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? 'Loading...' : 'Sign In with Google'}
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="mx-auto w-48 sm:w-64">
          <Mascot />
        </div>
        <h2 className="mt-8 bg-gradient-to-r from-primary via-purple-500 to-green-400 bg-clip-text font-headline text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
          Simply and Lovely Learning
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Master any subject with a personal AI tutor that understands your pace and adapts to your goals. Let's make learning feel effortless.
        </p>
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          className="mt-10 group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-500 px-10 py-4 font-medium text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          size="lg"
        >
          <span className="absolute inset-0 h-full w-full bg-white opacity-10 transition-opacity duration-300 group-hover:opacity-20"></span>
          Start Studying
        </Button>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>Built for the Google Hackathon.</p>
      </footer>
    </div>
  );
}
