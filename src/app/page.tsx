'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/context/UserSessionContext';

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useUserSession();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return null; // Or a loading spinner
}
