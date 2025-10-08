
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/context/UserSessionContext';
import Mascot from '@/components/mascot';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useUserSession();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-48 h-48 mb-6">
            <Mascot />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter">
            Welcome to <span className="font-brand text-primary">Noether</span>
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
            Your personal AI study assistant to master any subject. Let's unlock your potential.
        </p>
        <div className="mt-8 flex gap-4">
            <Button asChild size="lg">
                <Link href="/login">Sign In & Get Started</Link>
            </Button>
        </div>
    </div>
  );
}
