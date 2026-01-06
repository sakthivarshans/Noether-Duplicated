'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useUserSession } from './UserSessionContext';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

interface PomodoroContextType {
  minutes: number;
  seconds: number;
  isActive: boolean;
  isBreak: boolean;
  toggle: () => void;
  reset: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const [minutes, setMinutes] = useState(WORK_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const userSession = useUserSession();

  const logStudySession = useCallback(() => {
    if (!sessionStartTime || !userSession) return;
    userSession.addStudySession({
      startTime: sessionStartTime.toISOString(),
      endTime: new Date().toISOString(),
      duration: WORK_MINUTES,
    });
  }, [sessionStartTime, userSession]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer ended
            if (isBreak) { // Break ended, start new work session
              setMinutes(WORK_MINUTES);
              setIsBreak(false);
            } else { // Work session ended, log it and start break
              logStudySession();
              setMinutes(BREAK_MINUTES);
              setIsBreak(true);
            }
            setSeconds(0);
            setIsActive(false);
            // Optional: Play a sound
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, isBreak, logStudySession]);

  const toggle = () => {
    if (!isActive && minutes === WORK_MINUTES && seconds === 0 && !isBreak) {
      setSessionStartTime(new Date());
    }
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(WORK_MINUTES);
    setSeconds(0);
    setSessionStartTime(null);
  };

  return (
    <PomodoroContext.Provider value={{ minutes, seconds, isActive, isBreak, toggle, reset }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
