'use client';
import { useMusic } from '@/context/MusicContext';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Music, GripVertical, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';

export default function FloatingMusicPlayer() {
  const { isPlaying, currentTrack, togglePlay, playNext, playPrevious } = useMusic();
  const pathname = usePathname();
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial position only on the client
    setPosition({ x: window.innerWidth - 260, y: window.innerHeight - 180 });

    const handleResize = () => {
      setPosition(prev => {
        if (!prev) return null;
        return {
          x: Math.min(prev.x, window.innerWidth - (playerRef.current?.offsetWidth || 240)),
          y: Math.min(prev.y, window.innerHeight - (playerRef.current?.offsetHeight || 120)),
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!position) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  if (!isPlaying || pathname === '/dashboard/music' || !position) {
    return null;
  }

  return (
    <div
      ref={playerRef}
      className="fixed z-50"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Card className="w-60 shadow-lg">
        <div
          className="flex items-center gap-1 p-2 cursor-grab active:cursor-grabbing bg-secondary/50 rounded-t-lg"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
          <p className="font-semibold text-sm text-muted-foreground truncate">{currentTrack.title}</p>
        </div>
        <div className="p-3 pt-2">
            <div className="flex items-center gap-3">
              <Music className="h-6 w-6 text-primary" />
              <div className="flex-1 truncate">
                  <p className="font-bold text-sm truncate">{currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
            </div>
            <div className="flex justify-around items-center mt-2">
                <Button variant="ghost" size="icon" onClick={playPrevious}>
                    <SkipBack className="w-5 h-5"/>
                </Button>
                <Button variant="ghost" size="icon" onClick={togglePlay}>
                    {isPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                </Button>
                <Button variant="ghost" size="icon" onClick={playNext}>
                    <SkipForward className="w-5 h-5"/>
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
}
