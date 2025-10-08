'use client';

import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react';
import type { GameScore } from './GameScoreContext';
import type { Task } from './TaskContext';

interface StudySession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface UserSessionContextType {
  studySessions: StudySession[];
  tasks: Task[];
  gameScores: GameScore[];
  addStudySession: (session: StudySession) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addGameScore: (score: GameScore) => void;
  isLoading: boolean;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export const UserSessionProvider = ({ children }: { children: ReactNode }) => {
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem('studySessions');
      const storedTasks = localStorage.getItem('tasks');
      const storedGameScores = localStorage.getItem('gameScores');

      if (storedSessions) setStudySessions(JSON.parse(storedSessions));
      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedGameScores) setGameScores(JSON.parse(storedGameScores));
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addStudySession = (session: StudySession) => {
    setStudySessions(prev => {
        const updated = [...prev, session];
        localStorage.setItem('studySessions', JSON.stringify(updated));
        return updated;
    });
  }

  const addTask = (task: Task) => {
    setTasks(prev => {
        const updated = [...prev, task];
        localStorage.setItem('tasks', JSON.stringify(updated));
        return updated;
    });
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => {
        const updated = prev.map(t => t.id === taskId ? {...t, ...updates} : t);
        localStorage.setItem('tasks', JSON.stringify(updated));
        return updated;
    });
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => {
        const updated = prev.filter(t => t.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(updated));
        return updated;
    });
  }
  
  const addGameScore = (score: GameScore) => {
    setGameScores(prev => {
        const updated = [...prev, score];
        localStorage.setItem('gameScores', JSON.stringify(updated));
        return updated;
    });
  }
  
  const contextValue = useMemo(() => ({
    studySessions,
    tasks,
    gameScores,
    addStudySession,
    addTask,
    updateTask,
    deleteTask,
    addGameScore,
    isLoading,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [studySessions, tasks, gameScores, isLoading]);
  
  if (isLoading) {
    return null;
  }

  return (
    <UserSessionContext.Provider value={contextValue}>
      {children}
    </UserSessionContext.Provider>
  );
};

export const useUserSession = () => {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return context;
};
