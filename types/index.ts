// types/index.ts

// Base types
export type ID = string;
export type ISODate = string;
export type Timestamp = number;

// User types
export interface User {
  id: ID;
  email: string;
  name: string;
  avatar?: string;
  timezone: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface UserProfile extends User {
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  reminderTime: string; // HH:mm format
  dailyDigest: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  habitsVisibility: 'public' | 'friends' | 'private';
}

export interface UserStats {
  totalHabits: number;
  activeHabits: number;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

// Habit types
export interface Habit {
  id: ID;
  userId: ID;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  target: HabitTarget;
  color: string;
  icon: string;
  createdAt: ISODate;
  updatedAt: ISODate;
  archivedAt?: ISODate;
}

export interface HabitWithStats extends Habit {
  stats: HabitStats;
  todayCompleted: boolean;
  currentStreak: number;
  bestStreak: number;
}

export interface HabitCategory {
  id: ID;
  name: string;
  color: string;
  icon: string;
}

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface HabitTarget {
  type: 'boolean' | 'count' | 'duration' | 'range';
  value?: number;
  unit?: string;
  min?: number;
  max?: number;
}

export interface HabitStats {
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  thisWeekCompletions: number;
  thisMonthCompletions: number;
}

// Habit tracking types
export interface HabitRecord {
  id: ID;
  habitId: ID;
  userId: ID;
  date: ISODate;
  value: number;
  duration?: number; // in seconds
  notes?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface HabitCompletion {
  habitId: ID;
  date: ISODate;
  completed: boolean;
  value?: number;
  duration?: number;
}

export interface StreakData {
  current: number;
  best: number;
  history: StreakHistoryEntry[];
}

export interface StreakHistoryEntry {
  startDate: ISODate;
  endDate: ISODate;
  length: number;
}

// Date and time types
export interface DateRange {
  start: ISODate;
  end: ISODate;
}

export interface WeekData {
  week: ISODate; // Monday date
  days: DayData[];
}

export interface DayData {
  date: ISODate;
  completions: HabitCompletion[];
  totalCompleted: number;
  totalHabits: number;
}

export interface MonthData {
  month: string; // YYYY-MM
  days: DayData[];
  totalCompletions: number;
  completionRate: number;
}

// UI state types
export interface UIState {
  sidebarOpen: boolean;
  selectedDate: ISODate;
  viewMode: 'day' | 'week' | 'month';
  filterCategory?: ID;
  searchQuery: string;
  loading: boolean;
}

export interface ModalState {
  createHabitOpen: boolean;
  editHabitOpen: boolean;
  deleteHabitOpen: boolean;
  settingsOpen: boolean;
  profileOpen: boolean;
}

// Form types
export interface CreateHabitForm {
  name: string;
  description: string;
  categoryId: ID;
  frequency: HabitFrequency;
  targetType: HabitTarget['type'];
  targetValue: string;
  targetUnit: string;
  color: string;
  icon: string;
}

export interface UpdateHabitForm extends Partial<CreateHabitForm> {
  id: ID;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  name: string;
}

export interface ProfileForm {
  name: string;
  avatar?: string;
  timezone: string;
  preferences: UserPreferences;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Server action types
export interface ServerActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// Component props types
export interface HabitCardProps {
  habit: HabitWithStats;
  onToggle: (habitId: ID, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: ID) => void;
  showStats?: boolean;
}

export interface HabitListProps {
  habits: HabitWithStats[];
  loading?: boolean;
  onToggle: (habitId: ID, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: ID) => void;
}

export interface CalendarProps {
  selectedDate: ISODate;
  onSelectDate: (date: ISODate) => void;
  completions: HabitCompletion[];
  habits: Habit[];
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}

// Chart data types
export interface ChartDataPoint {
  date: ISODate;
  value: number;
  label?: string;
}

export interface ProgressChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'area';
  height?: number;
}

export interface HeatmapData {
  date: ISODate;
  count: number;
  intensity: number; // 0-100
}

// Notification types
export interface Notification {
  id: ID;
  userId: ID;
  type: 'reminder' | 'achievement' | 'streak' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: ISODate;
  data?: Record<string, any>;
}

// Export all types for barrel export
export type {
  // Re-export