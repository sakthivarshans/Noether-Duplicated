'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { games } from '@/lib/data';
import { ArrowRight, Award, Brain, Atom, Dna, FlaskConical, Microscope, Rocket, TestTube, Lightbulb, Zap, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useGameScores } from '@/context/GameScoreContext';

const gameIcons: { [key: string]: React.ElementType } = {
  sudoku: Brain,
  memory: Dna,
  reaction: Zap,
  quiz: BrainCircuit,
};

export default function GamesPage() {
  const { totalScore, getHighScore } = useGameScores();

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
            <h1 className="font-headline text-3xl font-bold">Brain Games & Quizzes</h1>
            <p className="text-muted-foreground">Take a break, sharpen your mind, or test your knowledge.</p>
        </div>
        <Card className="p-3">
            <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary"/>
                <span className="text-2xl font-bold">{totalScore}</span>
                <span className="text-muted-foreground">Total Points (This Week)</span>
            </div>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map(game => {
          const Icon = gameIcons[game.id] || Brain;
          const highScore = getHighScore(game.id);
          const href = game.id === 'quiz' ? '/dashboard/quiz' : `/dashboard/games/${game.id}`;
          return (
            <Link href={href} key={game.id}>
              <Card className="group h-full flex flex-col justify-between hover:bg-accent hover:border-primary/50 transition-all transform hover:-translate-y-1">
                <div>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-bold">{game.name}</CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">High Score (This Week): <span className="font-bold text-foreground">{highScore}</span></p>
                  </CardContent>
                </div>
                <div className="p-6 pt-0">
                    <p className="text-sm font-medium text-primary flex items-center">
                      Play Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
