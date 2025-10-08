'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { isThisWeek } from 'date-fns';

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

  const scoresCollectionPath = useMemo(() => {
    if (!user) return null;
    return `users/${user.uid}/gameScores`;
  }, [user]);

  const scoresQuery = useMemoFirebase(() => {
    if (!scoresCollectionPath || !firestore) return null;
    return collection(firestore, scoresCollectionPath);
  }, [scoresCollectionPath, firestore]);

  const { data: allScores, isLoading: areScoresLoading } = useCollection<GameScore>(scoresQuery);

  const weeklyScores = useMemo(() => {
    if (!allScores) return [];
    return allScores.filter(score => isThisWeek(new Date(score.playedDate), { weekStartsOn: 1 }));
  }, [allScores]);

  const totalScore = useMemo(() => {
    return weeklyScores.reduce((sum, score) => sum + score.score, 0);
  }, [weeklyScores]);

  const getHighScore = (gameName: string) => {
    const gameScores = weeklyScores.filter(s => s.gameName === gameName);
    if (gameScores.length === 0) return 0;
    return Math.max(...gameScores.map(s => s.score));
  };
  
  const addScore = (gameName: string, score: number) => {
    if (!firestore || !scoresCollectionPath || !user) return;
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
  }), [weeklyScores, totalScore, areScoresLoading]);


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
