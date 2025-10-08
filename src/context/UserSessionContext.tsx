
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';
import type { GameScore } from './GameScoreContext';
import type { Task } from './TaskContext';

interface StudySession {
  id: string;
  duration: number;
  endTime: string;
}

interface UserSessionContextType {
  studySessions: StudySession[];
  tasks: Task[];
  gameScores: GameScore[];
  isLoading: boolean;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export const UserSessionProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!user || user.isAnonymous || !firestore) return null;
    return collection(firestore, `users/${user.uid}/studySessions`);
  }, [user, firestore]);

  const tasksQuery = useMemoFirebase(() => {
    if (!user || user.isAnonymous || !firestore) return null;
    return collection(firestore, `users/${user.uid}/todoTasks`);
  }, [user, firestore]);

  const gameScoresQuery = useMemoFirebase(() => {
    if (!user || user.isAnonymous || !firestore) return null;
    return collection(firestore, `users/${user.uid}/gameScores`);
  }, [user, firestore]);

  const { data: studySessions, isLoading: sessionsLoading } = useCollection<StudySession>(sessionsQuery);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);
  const { data: gameScores, isLoading: gameScoresLoading } = useCollection<GameScore>(gameScoresQuery);

  const isLoading = isUserLoading || sessionsLoading || tasksLoading || gameScoresLoading;
  
  const contextValue = useMemo(() => ({
    studySessions: studySessions || [],
    tasks: tasks || [],
    gameScores: gameScores || [],
    isLoading,
  }), [studySessions, tasks, gameScores, isLoading]);
  
  // Do not render children until the initial user load and subsequent data fetches are complete.
  // This is the key fix to prevent downstream components from triggering their own hooks too early.
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
