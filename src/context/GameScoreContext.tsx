'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
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
  const { gameScores: allScores, addGameScore: addUserSessionScore, isLoading } = useUserSession();

  const weeklyScores = useMemo(() => {
    if (!allScores) return [];
    return allScores.filter(score => isThisWeek(new Date(score.playedDate), { weekStartsOn: 1 }));
  }, [allScores]);

  const totalScore = useMemo(() => {
    return weeklyScores.reduce((sum, score) => sum + score.score, 0);
  }, [weeklyScores]);

  const getHighScore = (gameName: string) => {
    const gameScoresForGame = weeklyScores.filter(s => s.gameName === gameName);
    if (gameScoresForGame.length === 0) return 0;
    return Math.max(...gameScoresForGame.map(s => s.score));
  };
  
  const addScore = (gameName: string, score: number) => {
    const newScore = {
      gameName,
      score,
      playedDate: new Date().toISOString(),
    };
    addUserSessionScore(newScore);
  };

  const contextValue = useMemo(() => ({
    scores: weeklyScores,
    totalScore,
    getHighScore,
    addScore,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [weeklyScores, totalScore]);
  
  if (isLoading) {
    return null; // Don't render children until session data is loaded
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
