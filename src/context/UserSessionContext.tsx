'use client';
import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { GameScore } from './GameScoreContext';
import type { Task } from './TaskContext';

interface StudySession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface UserSessionContextType {
  user: UserProfile | null;
  studySessions: StudySession[];
  tasks: Task[];
  gameScores: GameScore[];
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addGameScore: (score: Omit<GameScore, 'id'>) => void;
  isLoading: boolean;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(
  undefined
);

export const UserSessionProvider = ({ children }: { children: ReactNode }) => {
  const { firestore, user: authUser, isUserLoading } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  const userProfileRef = useMemoFirebase(
    () => (authUser ? doc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser]
  );
  const { data: user, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const studySessionsRef = useMemoFirebase(
    () => (authUser ? collection(firestore, 'users', authUser.uid, 'studySessions') : null),
    [firestore, authUser]
  );
  const { data: studySessions, isLoading: areSessionsLoading } = useCollection<StudySession>(studySessionsRef);

  const tasksRef = useMemoFirebase(
    () => (authUser ? collection(firestore, 'users', authUser.uid, 'todoTasks') : null),
    [firestore, authUser]
  );
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksRef);
  
  const gameScoresRef = useMemoFirebase(
    () => (authUser ? collection(firestore, 'users', authUser.uid, 'gameScores') : null),
    [firestore, authUser]
  );
  const { data: gameScores, isLoading: areScoresLoading } = useCollection<GameScore>(gameScoresRef);


  const isLoading = isUserLoading || isProfileLoading || areSessionsLoading || areTasksLoading || areScoresLoading;
  
  useEffect(() => {
    if (!isUserLoading && !authUser && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
      router.replace('/login');
    }
  }, [isUserLoading, authUser, pathname, router]);

  const addStudySession = async (session: Omit<StudySession, 'id'>) => {
    if (!authUser) return;
    const newSessionId = new Date(session.startTime).toISOString();
    const sessionRef = doc(firestore, `users/${authUser.uid}/studySessions`, newSessionId);
    await setDoc(sessionRef, { ...session, id: newSessionId });
  };
  
  const addTask = async (task: Omit<Task, 'id'|'completed'>) => {
    if (!authUser) return;
    const newTaskId = doc(collection(firestore, `users/${authUser.uid}/todoTasks`)).id;
    const taskRef = doc(firestore, `users/${authUser.uid}/todoTasks`, newTaskId);
    await setDoc(taskRef, { ...task, id: newTaskId, completed: false, userId: authUser.uid });
  };
  
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!authUser) return;
    const taskRef = doc(firestore, `users/${authUser.uid}/todoTasks`, taskId);
    await setDoc(taskRef, updates, { merge: true });
  };
  
  const deleteTask = async (taskId: string) => {
    if (!authUser) return;
    const taskRef = doc(firestore, `users/${authUser.uid}/todoTasks`, taskId);
    // In a real app, you would call `deleteDoc(taskRef)`.
    // For now, we will just simulate it on the client
    console.log("Deleting task:", taskId);
  };
  
  const addGameScore = async (score: Omit<GameScore, 'id'>) => {
    if (!authUser) return;
    const newScoreId = doc(collection(firestore, `users/${authUser.uid}/gameScores`)).id;
    const scoreRef = doc(firestore, `users/${authUser.uid}/gameScores`, newScoreId);
    await setDoc(scoreRef, { ...score, id: newScoreId, userId: authUser.uid });
  };

  const contextValue = useMemo(
    () => ({
      user: user || null,
      studySessions: studySessions || [],
      tasks: tasks || [],
      gameScores: gameScores || [],
      addStudySession,
      addTask,
      updateTask,
      deleteTask,
      addGameScore,
      isLoading,
    }),
    [user, studySessions, tasks, gameScores, isLoading]
  );
  
  // While initial user or data is loading, show a full-screen loader
  if (isUserLoading || (authUser && isLoading && (pathname.startsWith('/dashboard')))) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
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
