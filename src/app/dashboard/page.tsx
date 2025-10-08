'use client';

import {
  BookOpen,
  Calendar,
  FileQuestion,
  ListTodo,
  Bed,
  Music,
  Puzzle,
  Search,
  Timer,
  Upload,
  Bell,
  Waypoints,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Mascot from '@/components/mascot';
import { Button } from '@/components/ui/button';
import { quotes } from '@/lib/data';
import React from 'react';
import { useTasks } from '@/context/TaskContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Autoplay from "embla-carousel-autoplay";
import { StreakTracker } from '@/components/dashboard/StreakTracker';
import { useGameScores } from '@/context/GameScoreContext';

const tools = [
  { href: '/dashboard/upload', label: 'Upload Document', icon: Upload, description: 'Upload PPT/PDF for AI summaries and flashcards' },
  { href: '/dashboard/timetable', label: 'Timetable', icon: Calendar, description: 'Generate your personalized study schedule' },
  { href: '/dashboard/todo', label: 'To-Do List', icon: ListTodo, description: 'Track assignments and deadlines' },
  { href: '/dashboard/flashcards', label: 'Flashcards', icon: BookOpen, description: 'Review with AI-generated flashcards' },
  { href: '/dashboard/roadmap', label: 'Learning Roadmap', icon: Waypoints, description: 'Generate a learning path for a new topic' },
  { href: '/dashboard/games', label: 'Games', icon: Puzzle, description: 'Take a brain break with fun games' },
  { href: '/dashboard/music', label: 'Focus Music', icon: Music, description: 'Listen to concentration-boosting tracks' },
  { href: '/dashboard/pyq', label: 'PYQ Answers', icon: FileQuestion, description: 'Get AI-generated answers for past papers' },
  { href: '/dashboard/pomodoro', label: 'Pomodoro', icon: Timer, description: 'Stay focused with 25-minute sessions' },
  { href: '/dashboard/power-nap', label: 'Power Nap', icon: Bed, description: 'Recharge with a quick power nap' },
  { href: '/dashboard/search', label: 'Smart Citation', icon: Search, description: 'Get AI-powered summaries on any topic' },
  
];

function QuoteRotator() {
    const [quoteIndex, setQuoteIndex] = React.useState(0);

    React.useEffect(() => {
        // Math.random() is not safe for server components, but this is a client component
        setQuoteIndex(Math.floor(Math.random() * quotes.length));

        const interval = setInterval(() => {
            setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const quote = quotes[quoteIndex];

    return (
        <div className="text-center text-sm italic text-muted-foreground transition-opacity duration-1000">
            <p>&ldquo;{quote.text}&rdquo;</p>
            <p className="font-semibold not-italic mt-1">&ndash; {quote.author}</p>
        </div>
    );
}

function UpcomingTasks() {
  const { tasks } = useTasks();
  const upcomingTasks = tasks.filter(t => !t.completed);

  if (upcomingTasks.length === 0) {
    return (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold font-headline mb-2 text-foreground/80">Upcoming Tasks</h2>
          <p className="text-muted-foreground">You're all caught up! No pending tasks.</p>
        </div>
    );
  }

  return (
    <div className="w-full my-8">
       <h2 className="text-2xl font-bold font-headline mb-4 text-center text-foreground/80">Upcoming Tasks</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
            Autoplay({
              delay: 3000,
            }),
        ]}
        className="w-full max-w-xs mx-auto"
      >
        <CarouselContent>
          {upcomingTasks.map((task) => (
            <CarouselItem key={task.id}>
              <div className="p-1">
                <Card className="bg-gradient-to-r from-background to-secondary/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        {task.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">
                        Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}


export default function Dashboard() {
  const { totalScore } = useGameScores();
  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-lg bg-card border">
        <div className="space-y-4 text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold font-headline tracking-tighter">Meet Your Personal AI Study Assistant</h1>
          <p className="text-muted-foreground max-w-lg mx-auto md:mx-0">Master any subject with an AI tutor that understands your pace and your goals. Let&apos;s get started.</p>
          <div className="flex justify-center md:justify-start">
            <Button asChild>
              <Link href="/dashboard/pomodoro">
                <Timer className="mr-2 h-4 w-4"/> Start Studying
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Card className="p-3">
              <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary"/>
                  <span className="text-2xl font-bold">{totalScore}</span>
                  <span className="text-muted-foreground">Points</span>
              </div>
          </Card>
          <StreakTracker />
          <div className="w-40 h-40 md:w-48 md:h-48">
            <Mascot />
          </div>
        </div>
      </div>
      
      <UpcomingTasks />

      <div className="text-center my-8">
        <QuoteRotator />
        <h2 className="text-2xl font-bold font-headline mt-4 mb-2 text-foreground/80">Your Study Tools</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool, index) => (
          <Link href={tool.href} key={tool.href}>
            <Card className="group h-full p-6 text-center flex flex-col items-center justify-center rounded-3xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
              <div 
                className={`absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${index % 3 === 0 ? 'bg-gradient-to-br from-purple-500 to-blue-500' : index % 3 === 1 ? 'bg-gradient-to-br from-green-500 to-cyan-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'} dark:from-purple-900/20 dark:to-blue-900/20`}>
              </div>
              <div className="relative flex flex-col items-center justify-center">
                  <div className="p-4 bg-white/50 dark:bg-black/20 rounded-full mb-4">
                    <tool.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{tool.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
