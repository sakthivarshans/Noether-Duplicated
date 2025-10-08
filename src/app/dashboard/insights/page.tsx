'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CheckCircle, Clock, Gamepad2 } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';
import { useTasks } from '@/context/TaskContext';
import { useGameScores } from '@/context/GameScoreContext';
import { useMemo } from 'react';
import { isThisWeek, parseISO } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface StudySession {
  id: string;
  duration: number;
  endTime: string;
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function InsightsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const sessionsCollectionPath = useMemo(() => {
    if (!user) return null;
    return `users/${user.uid}/studySessions`;
  }, [user]);

  const sessionsQuery = useMemoFirebase(() => {
    if (!sessionsCollectionPath || !firestore) return null;
    return collection(firestore, sessionsCollectionPath);
  }, [sessionsCollectionPath, firestore]);

  const { data: allSessions } = useCollection<StudySession>(sessionsQuery);

  const weeklySessions = useMemo(() => {
    return (allSessions || []).filter(session => isThisWeek(parseISO(session.endTime), { weekStartsOn: 1 }));
  }, [allSessions]);

  const totalStudyMinutes = useMemo(() => {
    return weeklySessions.reduce((total, session) => total + session.duration, 0);
  }, [weeklySessions]);
  
  const studyDataByDay = useMemo(() => {
    const data = weekDays.map(day => ({ day, minutes: 0 }));
    weeklySessions.forEach(session => {
        const dayIndex = parseISO(session.endTime).getDay();
        data[dayIndex].minutes += session.duration;
    });
    return data;
  }, [weeklySessions]);


  const { tasks } = useTasks();
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const taskData = [
    { name: 'Completed', value: completedTasks, fill: 'hsl(var(--primary))' },
    { name: 'Pending', value: pendingTasks, fill: 'hsl(var(--muted))' },
  ];

  const { scores } = useGameScores();
  const totalGameScore = scores.reduce((acc, score) => acc + score.score, 0);

  const chartConfig = {
    minutes: {
      label: 'Minutes',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Platform Insights</CardTitle>
          <CardDescription>Monitor your study habits and track your progress.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time (This Week)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudyMinutes} minutes</div>
            <p className="text-xs text-muted-foreground">From completed Pomodoro sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed (All Time)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks} / {tasks.length}</div>
            <p className="text-xs text-muted-foreground">{pendingTasks} tasks remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Game Score (This Week)</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGameScore} points</div>
            <p className="text-xs text-muted-foreground">From all games played</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Study Activity</CardTitle>
          <CardDescription>Minutes spent in focus sessions each day.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={studyDataByDay} margin={{ top: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
               <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="minutes" fill="var(--color-minutes)" radius={8}>
                <LabelList
                    position="top"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) => (value > 0 ? value : null)}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>
  );
}
