'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { isThisWeek } from 'date-fns';
import { useUserSession } from './UserSessionContext';

export interface GameScore {
  id: string;
  gameName: string;
  score: number;
  playedDate: string; // ISO string
}

interface GameScoreContextType {
  scores: GameScore[];
  totalScore: number;
  getHighScore: (gameName: string) => number;
  addScore: (gameName: string, score: number) => void;
}

const GameScoreContext = createContext<GameScoreContextType | undefined>(undefined);

export const GameScoreProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { gameScores, isLoading } = useUserSession();

  const weeklyScores = useMemo(() => {
    if (!gameScores) return [];
    return gameScores.filter(score => isThisWeek(new Date(score.playedDate), { weekStartsOn: 1 }));
  }, [gameScores]);

  const totalScore = useMemo(() => {
    return weeklyScores.reduce((sum, score) => sum + score.score, 0);
  }, [weeklyScores]);

  const getHighScore = (gameName: string) => {
    const gameScoresForGame = weeklyScores.filter(s => s.gameName === gameName);
    if (gameScoresForGame.length === 0) return 0;
    return Math.max(...gameScoresForGame.map(s => s.score));
  };
  
  const addScore = (gameName: string, score: number) => {
    if (!firestore || !user) return;
    const scoresCollectionPath = `users/${user.uid}/gameScores`;
    const newScore = {
      gameName,
      score,
      playedDate: new Date().toISOString(),
      userId: user.uid,
    };
    const collectionRef = collection(firestore, scoresCollectionPath);
    addDocumentNonBlocking(collectionRef, newScore);
  };

  const contextValue = useMemo(() => ({
    scores: weeklyScores,
    totalScore,
    getHighScore,
    addScore,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [weeklyScores, totalScore]);
  
  if (isLoading) {
      return null;
  }

  return (
    <GameScoreContext.Provider value={contextValue}>
      {children}
    </GameScoreContext.Provider>
  );
};

export const useGameScores = () => {
  const context = useContext(GameScoreContext);
  if (context === undefined) {
    throw new Error('useGameScores must be used within a GameScoreProvider');
  }
  return context;
};
