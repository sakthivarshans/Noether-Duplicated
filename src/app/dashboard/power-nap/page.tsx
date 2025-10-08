
'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import * as Tone from 'tone';

const problems = [
  { q: '8 × 4', a: '32' },
  { q: '√49', a: '7' },
  { q: '36 ÷ 6', a: '6' },
  { q: '9 × 7', a: '63' },
  { q: '12 + 19', a: '31' },
  { q: '5 × 5', a: '25' },
  { q: '100 - 42', a: '58'},
];

export default function PowerNapPage() {
  const [duration, setDuration] = useState(2);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [problem, setProblem] = useState(problems[0]);
  const [answer, setAnswer] = useState('');
  const synthRef = useRef<Tone.Synth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft !== null && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      handleAlarm();
    }
    return () => clearTimeout(timer);
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setTimeLeft(duration * 60);
    setIsActive(true);
  };

  const handleCancel = () => {
    setIsActive(false);
    setTimeLeft(null);
  };

  const handleAlarm = async () => {
    await Tone.start();
    synthRef.current = new Tone.Synth().toDestination();
    
    // Math.random() is safe here as it's a client component
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    setProblem(randomProblem);

    loopRef.current = new Tone.Loop((time) => {
        synthRef.current?.triggerAttackRelease("C5", "8n", time);
    }, "2n").start(0);

    Tone.Transport.start();
    setShowAlarm(true);
  };

  const stopAlarm = () => {
    if (answer.trim() === problem.a) {
      if (loopRef.current) {
        loopRef.current.stop(0);
        Tone.Transport.stop();
        Tone.Transport.cancel();
        loopRef.current.dispose();
        synthRef.current?.dispose();
      }
      setShowAlarm(false);
      setAnswer('');
      setTimeLeft(null);
    } else {
      // Shake animation or incorrect feedback
      setAnswer('');
    }
  };
  
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Power Nap</CardTitle>
          <CardDescription>
            A quick nap can boost your memory and creativity.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="w-full space-y-4">
            <p className="text-center text-5xl font-bold font-mono">
              {isActive ? formatTime(timeLeft) : `${duration} min`}
            </p>
            {!isActive && (
              <Slider
                defaultValue={[2]}
                max={30}
                min={2}
                step={1}
                onValueChange={(value) => setDuration(value[0])}
              />
            )}
          </div>
          <div className="flex gap-4">
            {isActive ? (
              <Button size="lg" variant="destructive" onClick={handleCancel}>
                Cancel Nap
              </Button>
            ) : (
              <Button size="lg" onClick={handleStart}>
                Start {duration} Min Nap
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showAlarm}>
        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Time to Wake Up!</AlertDialogTitle>
            <AlertDialogDescription>
              Solve the math problem below to turn off the alarm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 text-center text-3xl font-bold">{problem.q} = ?</div>
          <Input
            type="text"
            placeholder="Your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && stopAlarm()}
          />
          <AlertDialogFooter>
            <AlertDialogAction onClick={stopAlarm}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
