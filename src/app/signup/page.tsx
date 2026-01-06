'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import Mascot from '@/components/mascot';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name });

      // Create user profile in Firestore
      const userProfile = {
        id: user.uid,
        name: name,
        email: user.email,
      };
      await setDoc(doc(firestore, 'users', user.uid), userProfile);

      toast({
        title: 'Account Created!',
        description: 'Welcome to Noether. You are now being redirected.',
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description:
          error.message || 'An unexpected error occurred. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24">
            <Mascot />
          </div>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">
              Create an Account
            </CardTitle>
            <CardDescription>
              Join Noether to start your AI-powered learning journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
