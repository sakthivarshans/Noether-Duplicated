'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
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
  const [scores, setScores] = useState<GameScore[]>([]);

  useEffect(() => {
    // Load scores from localStorage on mount
    try {
      const storedScores = localStorage.getItem('gameScores');
      if (storedScores) {
        setScores(JSON.parse(storedScores));
      }
    } catch (error) {
      console.error("Failed to parse scores from localStorage", error);
      setScores([]);
    }
  }, []);

  const weeklyScores = useMemo(() => {
    return scores.filter(score => isThisWeek(new Date(score.playedDate), { weekStartsOn: 1 }));
  }, [scores]);

  const totalScore = useMemo(() => {
    return weeklyScores.reduce((sum, score) => sum + score.score, 0);
  }, [weeklyScores]);

  const getHighScore = (gameName: string) => {
    const gameScoresForGame = weeklyScores.filter(s => s.gameName === gameName);
    if (gameScoresForGame.length === 0) return 0;
    return Math.max(...gameScoresForGame.map(s => s.score));
  };
  
  const addScore = (gameName: string, score: number) => {
    const newScore: GameScore = {
      id: new Date().toISOString(), // Simple unique ID
      gameName,
      score,
      playedDate: new Date().toISOString(),
    };
    
    setScores(prevScores => {
        const updatedScores = [...prevScores, newScore];
        try {
            localStorage.setItem('gameScores', JSON.stringify(updatedScores));
        } catch (error) {
            console.error("Failed to save scores to localStorage", error);
        }
        return updatedScores;
    });
  };

  const contextValue = useMemo(() => ({
    scores: weeklyScores,
    totalScore,
    getHighScore,
    addScore,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [weeklyScores, totalScore]);

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
