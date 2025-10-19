'use client';

import React, { useMemo } from 'react';
import { ProgressChart } from '@/components/ProgressChart';
import { useHabits } from '@/hooks/useHabits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Flame, Target, TrendingUp, Trophy, Clock } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays, startOfDay } from 'date-fns';

export default function StatisticsScreen() {
  const { habits, habitRecords, loading } = useHabits();

  const statistics = useMemo(() => {
    if (!habits.length || !habitRecords.length) {
      return {
        totalHabits: 0,
        overallCompletionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyProgress: [],
        monthlyProgress: [],
        topHabits: [],
        totalCompletions: 0,
        averageDailyCompletions: 0,
        bestDay: null,
        habitInsights: []
      };
    }

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const monthStart = subDays(today, 30);

    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const monthDays = eachDayOfInterval({ start: monthStart, end: today });

    const weeklyProgress = weekDays.map(day => {
      const dayRecords = habitRecords.filter(record => 
        format(new Date(record.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      const completedHabits = dayRecords.filter(record => record.completed).length;
      return {
        date: format(day, 'EEE'),
        value: habits.length > 0 ? (completedHabits / habits.length) * 100 : 0,
        completed: completedHabits,
        total: habits.length
      };
    });

    const monthlyProgress = monthDays.map(day => {
      const dayRecords = habitRecords.filter(record => 
        format(new Date(record.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      const completedHabits = dayRecords.filter(record => record.completed).length;
      return {
        date: format(day, 'MMM dd'),
        value: habits.length > 0 ? (completedHabits / habits.length) * 100 : 0,
        completed: completedHabits,
        total: habits.length
      };
    });

    const totalRecords = habitRecords.filter(record => record.completed).length;
    const overallCompletionRate = habits.length > 0 
      ? (totalRecords / (habits.length * monthDays.length)) * 100 
      : 0;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const sortedDays = monthDays.sort((a, b) => b.getTime() - a.getTime());
    const processedDays = new Set();

    sortedDays.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      if (processedDays.has(dayStr)) return;
      processedDays.add(dayStr);

      const dayRecords = habitRecords.filter(record => 
        format(new Date(record.date), 'yyyy-MM-dd') === dayStr
      );
      const allCompleted = habits.every(habit => 
        dayRecords.some(record => record.habitId === habit.id && record.completed)
      );

      if (allCompleted) {
        if (currentStreak === 0 && dayStr === format(today, 'yyyy-MM-dd')) {
          currentStreak = 1;
        } else if (currentStreak > 0) {
          currentStreak++;
        }
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (currentStreak === 0 && dayStr !== format(today, 'yyyy-MM-dd')) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    });

    const habitStats = habits.map(habit => {
      const habitRecordsFiltered = habitRecords.filter(record => record.habitId === habit.id);
      const completedCount = habitRecordsFiltered.filter(record => record.completed).length;
      const completionRate = habitRecordsFiltered.length > 0 
        ? (completedCount / habitRecordsFiltered.length) * 100 
        : 0;
      
      let streak = 0;
      let tempStreak = 0;
      const days = eachDayOfInterval({ start: monthStart, end: today });
      days.reverse().forEach(day => {
        const record = habitRecords.find(r => 
          r.habitId === habit.id && 
          format(new Date(r.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        if (record?.completed) {
          streak++;
          tempStreak++;
        } else {
          tempStreak = 0;
        }
      });

      return {
        habit,
        completionRate,
        streak,
        totalCompletions: completedCount
      };
    });

    const topHabits = habitStats
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3);

    const dailyCompletions = {};
    monthDays.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayRecords = habitRecords.filter(record => 
        format(new Date(record.date), 'yyyy-MM-dd') === dayStr
      );
      dailyCompletions[dayStr] = dayRecords.filter(record => record.completed).length;
    });

    const bestDay = Object.entries(dailyCompletions).reduce((max, [date, count]) => 
      count > max.count ? { date, count } : max
    , { date: null, count: 0 });

    const totalCompletions = habitRecords.filter(record => record.completed).length;
    const averageDailyCompletions = monthDays.length > 0 
      ? totalCompletions / monthDays.length 
      : 0;

    const habitInsights = habits.map(habit => {
      const habitDays = habitRecords
        .filter(record => record.habitId === habit.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const firstCompletion = habitDays.find(r => r.completed);
      const daysSinceFirst = firstCompletion 
        ? differenceInDays(today, new Date(firstCompletion.date))
        : 0;
      
      const completions = habitDays.filter(r => r.completed).length;
      const averageDaysBetween = daysSinceFirst > 0 && completions > 1