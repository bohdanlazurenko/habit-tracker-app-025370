```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import { ProgressChart } from '@/components/ProgressChart';
import { StreakCounter } from '@/components/StreakCounter';
import { useHabits } from '@/hooks/useHabits';
import { Habit, HabitCompletion } from '@/types/habit';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function HabitDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.id as string;
  const { getHabit, updateHabit, deleteHabit, completeHabit, uncompleteHabit } = useHabits();
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const habitData = await getHabit(habitId);
        if (!habitData) {
          toast.error('Habit not found');
          router.push('/habits');
          return;
        }
        setHabit(habitData);
        setCompletions(habitData.completions || []);
      } catch (error) {
        console.error('Error fetching habit:', error);
        toast.error('Failed to load habit');
      } finally {
        setIsLoading(false);
      }
    };

    if (habitId) {
      fetchHabit();
    }
  }, [habitId, getHabit, router]);

  const handleToggleCompletion = async (date: Date) => {
    if (!habit) return;
    
    setIsUpdating(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCompleted = completions.some(c => c.date === dateStr);
    
    try {
      if (isCompleted) {
        await uncompleteHabit(habit.id, dateStr);
        setCompletions(prev => prev.filter(c => c.date !== dateStr));
        toast.success('Habit marked as incomplete');
      } else {
        await completeHabit(habit.id, dateStr);
        setCompletions(prev => [...prev, { date: dateStr, completedAt: new Date().toISOString() }]);
        toast.success('Habit marked as complete!');
      }
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error('Failed to update habit');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteHabit = async () => {
    if (!habit) return;
    
    if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteHabit(habit.id);
      toast.success('Habit deleted successfully');
      router.push('/habits');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  const getCompletionRate = () => {
    if (!habit || completions.length === 0) return 0;
    const daysSinceCreation = Math.ceil((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.round((completions.length / Math.max(daysSinceCreation, 1)) * 100);
  };

  const getRecentCompletions = () => {
    const last30Days = [];
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isCompleted = completions.some(c => c.date === dateStr);
      last30Days.push({ date, completed: isCompleted });
    }
    return last30Days.reverse();
  };

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Habit Not Found</h1>
          <Button onClick={() => router.push('/habits')}>Back to Habits</Button>
        </div>
      </div>
    );
  }

  const isCompletedToday = completions.some(c => c.date === format(new Date(), 'yyyy-MM-dd'));
  const completionRate = getCompletionRate();
  const recentCompletions = getRecentCompletions();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/habits/${habit.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteHabit}
              disabled={isUpdating}
            >
              Delete
            </Button>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{habit.name}</h1>
        {habit.description && (
          <p className="text-gray-600 mb-4">{habit.description}</p>
        )}
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Category:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {habit.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Frequency:</span>
            <span className="text-sm text-gray-700">{habit.frequency}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Target:</span>
            <span className="text-sm text-gray-700">{habit.target} per {habit.frequency.includes('daily') ? 'day' : 'week'}</span>
          </div>
        </div>
      </div>

      {/* Today's Status */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {isCompletedToday ? 'Completed!' : 'Not completed yet'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {completions.filter(c => c.date === format(new Date(), 'yyyy-MM-dd')).length} / {habit.target}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => handleToggleCompletion(new Date())}
              disabled={isUpdating}
              variant={isCompletedToday ? "outline" : "default"}
            >
              {isCompletedToday ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
          </div>
        </div