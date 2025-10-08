
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to the dashboard immediately
export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null; // Render nothing while redirecting
}
