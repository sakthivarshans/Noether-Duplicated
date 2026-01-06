'use client';
import Link from 'next/link';
import {
  Menu,
  Award,
  BarChart3,
  User as UserIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Mascot from '../mascot';
import { useGameScores } from '@/context/GameScoreContext';
import { ThemeToggle } from '../theme-toggle';
import { useUserSession } from '@/context/UserSessionContext';
import { useFirebase } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/upload', label: 'Upload' },
    { href: '/dashboard/pyq', label: 'PYQ' },
    { href: '/dashboard/search', label: 'Smart Citation' },
    { href: '/dashboard/roadmap', label: 'Roadmap' },
    { href: '/dashboard/timetable', label: 'Timetable' },
    { href: '/dashboard/todo', label: 'To-Do List' },
    { href: '/dashboard/pomodoro', label: 'Pomodoro' },
    { href: '/dashboard/power-nap', label: 'Power Nap' },
    { href: '/dashboard/flashcards', label: 'Flashcards' },
    { href: '/dashboard/games', label: 'Games' },
    { href: '/dashboard/music', label: 'Music' },
    { href: '/dashboard/insights', label: 'Insights', icon: BarChart3 },
  ];

export function Header() {
  const { totalScore } = useGameScores();
  const { user } = useUserSession();
  const { auth } = useFirebase();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const handleLogout = () => {
    auth.signOut();
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <div className="w-8 h-8"><Mascot/></div>
              <span className="font-brand text-2xl text-primary">Noether</span>
            </Link>
            {navItems.sort((a,b) => a.label.localeCompare(b.label)).map(item => (
                <Link
                key={item.href}
                href={item.href}
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        {/* Can be used for breadcrumbs or page titles */}
      </div>
      <ThemeToggle />
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        <span className="font-bold text-lg">{totalScore}</span>
      </div>
      {user && (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${user.email}`} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
               <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
               </div>
               <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      )}
    </header>
  );
}
