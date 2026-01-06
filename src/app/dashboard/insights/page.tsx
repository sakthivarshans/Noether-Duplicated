'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, Gamepad2 } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useGameScores } from '@/context/GameScoreContext';
import { useMemo, useState } from 'react';
import { isThisWeek, parseISO, subDays, format, isWithinInterval, isToday, getHours } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserSession } from '@/context/UserSessionContext';

type TimeRange = 'today' | 'this_week' | 'last_15_days';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const { studySessions: allSessions } = useUserSession();

  const filteredSessions = useMemo(() => {
    if (!allSessions) return [];
    const now = new Date();
    if (timeRange === 'today') {
      return allSessions.filter(session => isToday(parseISO(session.endTime)));
    }
    if (timeRange === 'this_week') {
      return allSessions.filter(session => isThisWeek(parseISO(session.endTime), { weekStartsOn: 0 }));
    } else { // 'last_15_days'
      const fifteenDaysAgo = subDays(now, 14); // 14 days ago to include today makes 15 days
      return allSessions.filter(session => isWithinInterval(parseISO(session.endTime), { start: fifteenDaysAgo, end: now }));
    }
  }, [allSessions, timeRange]);
  
  const totalStudyMinutes = useMemo(() => {
    return filteredSessions.reduce((total, session) => total + session.duration, 0);
  }, [filteredSessions]);
  
  const studyDataByDay = useMemo(() => {
    if (timeRange === 'today') {
        const data = Array.from({ length: 24 }, (_, i) => ({ name: `${i}:00`, minutes: 0 }));
        filteredSessions.forEach(session => {
            const hour = getHours(parseISO(session.endTime));
            data[hour].minutes += session.duration;
        });
        return data;
    }
    if (timeRange === 'this_week') {
        const data = weekDays.map(day => ({ name: day, minutes: 0 }));
        filteredSessions.forEach(session => {
            const dayIndex = parseISO(session.endTime).getDay();
            data[dayIndex].minutes += session.duration;
        });
        return data;
    } else { // 'last_15_days'
        const dataMap = new Map<string, number>();
        const now = new Date();
        for (let i = 0; i < 15; i++) {
            const day = subDays(now, i);
            const formattedDay = format(day, 'MMM d');
            dataMap.set(formattedDay, 0);
        }

        filteredSessions.forEach(session => {
            const dayStr = format(parseISO(session.endTime), 'MMM d');
            if(dataMap.has(dayStr)) {
                dataMap.set(dayStr, (dataMap.get(dayStr) || 0) + session.duration);
            }
        });
        
        return Array.from(dataMap.entries()).map(([name, minutes]) => ({ name, minutes })).reverse();
    }
  }, [filteredSessions, timeRange]);


  const { tasks } = useTasks();
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  const { totalScore } = useGameScores();

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
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudyMinutes} minutes</div>
            <p className="text-xs text-muted-foreground">in the selected period</p>
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
            <div className="text-2xl font-bold">{totalScore} points</div>
            <p className="text-xs text-muted-foreground">From all games played</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Study Activity</CardTitle>
            <CardDescription>Minutes spent in focus sessions each day.</CardDescription>
          </div>
           <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_15_days">Last 15 Days</SelectItem>
                </SelectContent>
            </Select>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={studyDataByDay} margin={{ top: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value, index) => {
                  if (timeRange === 'today') {
                    // Show every 4th hour
                    return index % 4 === 0 ? value : '';
                  }
                  return value;
                }}
                tick={{ fontSize: 12 }}
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
