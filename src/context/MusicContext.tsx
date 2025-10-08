'use client';
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { musicTracks } from '@/lib/data';

type MusicTrack = typeof musicTracks[0];

interface MusicContextType {
  currentTrack: MusicTrack;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  selectTrack: (trackId: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setBaseVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const currentTrack = musicTracks[currentTrackIndex];

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const playNext = useCallback(() => {
    setCurrentTrackIndex(prevIndex => (prevIndex + 1) % musicTracks.length);
    setIsPlaying(true);
  }, []);

  const playPrevious = useCallback(() => {
    setCurrentTrackIndex(prevIndex => (prevIndex - 1 + musicTracks.length) % musicTracks.length);
    setIsPlaying(true);
  }, []);

  const selectTrack = useCallback((trackId: number) => {
    const trackIndex = musicTracks.findIndex(t => t.id === trackId);
    if (trackIndex !== -1) {
      setCurrentTrackIndex(trackIndex);
      setIsPlaying(true);
    }
  }, []);
  
  const setVolume = useCallback((newVolume: number) => {
    setBaseVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const value = {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    togglePlay,
    playNext,
    playPrevious,
    selectTrack,
    setVolume,
    toggleMute,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
