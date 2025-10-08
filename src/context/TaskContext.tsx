'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes } from 'date-fns';
import { useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc, where, query } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';

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
  const { toast } = useToast();
  const [notifiedTasks, setNotifiedTasks] = useState<string[]>([]);

  const tasksCollectionPath = useMemo(() => {
    if (!user || user.isAnonymous) return null;
    return `users/${user.uid}/todoTasks`;
  }, [user]);

  const tasksQuery = useMemoFirebase(() => {
    if (!tasksCollectionPath || !firestore) return null;
    return collection(firestore, tasksCollectionPath);
  }, [tasksCollectionPath, firestore]);

  const { data: tasks = [], isLoading } = useCollection<Omit<Task, 'id'>>(tasksQuery);

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
    if (!title || !deadline || !user || !firestore || !tasksCollectionPath) return;
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
    if (!firestore || !tasksCollectionPath) return;
    const task = tasks?.find(t => t.id === id);
    if (!task) return;
    const docRef = doc(firestore, tasksCollectionPath, id);
    updateDocumentNonBlocking(docRef, { completed: !task.completed });
  };

  const deleteTask = (id: string) => {
    if (!firestore || !tasksCollectionPath) return;
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
