'use client';

import React, { createContext, useContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes } from 'date-fns';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { useUserSession } from './UserSessionContext';


export interface Task {
  id: string; // Changed from number to string for Firestore
  title: string;
  deadline: string;
  completed: boolean;
  userId: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, deadline: string) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { tasks, isLoading } = useUserSession();
  const { toast } = useToast();
  const [notifiedTasks, setNotifiedTasks] = useState<string[]>([]);

  useEffect(() => {
    const checkDeadlines = () => {
      if (isLoading || !tasks) return;
      tasks.forEach(task => {
        if (!task.completed && !notifiedTasks.includes(task.id)) {
          const now = new Date();
          const deadlineDate = new Date(task.deadline);
          const minutesUntilDeadline = differenceInMinutes(deadlineDate, now);

          if (minutesUntilDeadline > 0 && minutesUntilDeadline <= 45) {
            toast({
              title: 'Deadline Approaching!',
              description: `Your task "${task.title}" is due in less than 45 minutes.`,
            });
            setNotifiedTasks(prev => [...prev, task.id]);
          }
        }
      });
    };

    const intervalId = setInterval(checkDeadlines, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [tasks, toast, notifiedTasks, isLoading]);

  const addTask = (title: string, deadline: string) => {
    if (!title || !deadline || !user || !firestore) return;
    const tasksCollectionPath = `users/${user.uid}/todoTasks`;
    const newTask = {
      title,
      deadline,
      completed: false,
      userId: user.uid,
    };
    const collectionRef = collection(firestore, tasksCollectionPath);
    addDocumentNonBlocking(collectionRef, newTask);
  };

  const toggleTaskCompletion = (id: string) => {
    if (!firestore || !user || !tasks) return;
    const tasksCollectionPath = `users/${user.uid}/todoTasks`;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const docRef = doc(firestore, tasksCollectionPath, id);
    updateDocumentNonBlocking(docRef, { completed: !task.completed });
  };

  const deleteTask = (id: string) => {
    if (!firestore || !user) return;
    const tasksCollectionPath = `users/${user.uid}/todoTasks`;
    const docRef = doc(firestore, tasksCollectionPath, id);
    deleteDocumentNonBlocking(docRef);
  };

  const contextValue = useMemo(() => ({
    tasks: tasks || [],
    addTask,
    toggleTaskCompletion,
    deleteTask,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [tasks]);

  if (isLoading) {
    return null;
  }

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
