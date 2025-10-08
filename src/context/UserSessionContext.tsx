'use client';

import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { GameScore } from './GameScoreContext';
import type { Task } from './TaskContext';

interface StudySession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface FakeUser {
  name: string;
  email: string;
}

interface UserSessionContextType {
  user: FakeUser | null;
  studySessions: StudySession[];
  tasks: Task[];
  gameScores: GameScore[];
  addStudySession: (session: StudySession) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addGameScore: (score: GameScore) => void;
  login: (user: FakeUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export const UserSessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FakeUser | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('fakeUser');
      const storedSessions = localStorage.getItem('studySessions');
      const storedTasks = localStorage.getItem('tasks');
      const storedGameScores = localStorage.getItem('gameScores');
      
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      setUser(currentUser);

      if (storedSessions) setStudySessions(JSON.parse(storedSessions));
      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedGameScores) setGameScores(JSON.parse(storedGameScores));

      if (!currentUser && pathname.startsWith('/dashboard')) {
        router.replace('/login');
      }

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
       if (pathname.startsWith('/dashboard')) {
        router.replace('/login');
      }
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const login = (user: FakeUser) => {
    localStorage.setItem('fakeUser', JSON.stringify(user));
    setUser(user);
    router.push('/dashboard');
  }

  const logout = useCallback(() => {
    localStorage.removeItem('fakeUser');
    // Optional: clear all app data on logout
    localStorage.removeItem('studySessions');
    localStorage.removeItem('tasks');
    localStorage.removeItem('gameScores');
    setUser(null);
    setStudySessions([]);
    setTasks([]);
    setGameScores([]);
    router.push('/login');
  }, [router]);

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
    user,
    studySessions,
    tasks,
    gameScores,
    addStudySession,
    addTask,
    updateTask,
    deleteTask,
    addGameScore,
    login,
    logout,
    isLoading,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, studySessions, tasks, gameScores, isLoading, logout]);

  return (
    <UserSessionContext.Provider value={contextValue}>
      {isLoading ? null : children}
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
