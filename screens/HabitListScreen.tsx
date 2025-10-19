'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, SortAsc, Filter } from 'lucide-react'
import { HabitCard } from '@/components/HabitCard'
import { useHabits } from '@/hooks/useHabits'
import type { Habit } from '@/types/habit'

export default function HabitListScreen() {
  const { habits, loading, error, addHabit, deleteHabit, updateHabit } = useHabits()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'streak'>('createdAt')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitDescription, setNewHabitDescription] = useState('')
  const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly'>('daily')

  // Filter habits based on search query
  const filteredHabits = habits.filter(habit =>
    habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    habit.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort habits based on selected criteria
  const sortedHabits = [...filteredHabits].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'streak':
        return (b.currentStreak || 0) - (a.currentStreak || 0)
      case 'createdAt':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  // Handle adding a new habit
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    try {
      await addHabit({
        name: newHabitName,
        description: newHabitDescription,
        frequency: newHabitFrequency,
        completedDates: [],
        createdAt: new Date().toISOString(),
      })
      setNewHabitName('')
      setNewHabitDescription('')
      setNewHabitFrequency('daily')
      setShowAddForm(false)
    } catch (err) {
      console.error('Failed to add habit:', err)
    }
  }

  // Handle habit completion toggle
  const handleToggleComplete = async (habitId: string, completed: boolean) => {
    try {
      const habit = habits.find(h => h.id === habitId)
      if (!habit) return

      const today = new Date().toISOString().split('T')[0]
      const updatedCompletedDates = completed
        ? [...(habit.completedDates || []), today]
        : (habit.completedDates || []).filter(date => date !== today)

      await updateHabit(habitId, {
        completedDates: updatedCompletedDates,
        lastCompletedAt: completed ? new Date().toISOString() : habit.lastCompletedAt,
      })
    } catch (err) {
      console.error('Failed to update habit:', err)
    }
  }

  // Handle habit deletion
  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return
    try {
      await deleteHabit(habitId)
    } catch (err) {
      console.error('Failed to delete habit:', err)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Habits</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Habits</h1>
          <p className="text-gray-600">Track your daily habits and build consistency</p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SortAsc className="text-gray-400 h-5 w-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Recently Added</option>
                <option value="name">Name</option>
                <option value="streak">Longest Streak</option>
              </select>
            </div>

            {/* Add Habit Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Habit
            </button>
          </div>
        </div>

        {/* Add Habit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Habit</h2>
            <form onSubmit={handleAddHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Morning Meditation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add a description or motivation..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={newHabitFrequency}
                  onChange={(e) => setNewHabitFrequency(e.target.value as typeof newHabitFrequency)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option