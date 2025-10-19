import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { HabitProvider } from './src/contexts/HabitContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorScreen from './src/components/ErrorScreen';
import LoadingScreen from './src/components/LoadingScreen';
import { theme } from './src/styles/theme';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Ignore specific warnings in production
if (__DEV__) {
  LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
}

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Initialize app and check authentication state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Add any app initialization logic here
        // For example: checking deep links, restoring state, etc.
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  // Error fallback component
  const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
    error,
    resetErrorBoundary,
  }) => (
    <ErrorScreen
      error={error}
      onRetry={resetErrorBoundary}
    />
  );

  // Show loading screen while app initializes
  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <HabitProvider>
              <PaperProvider theme={theme}>
                <SafeAreaProvider>
                  <NavigationContainer
                    theme={theme}
                    linking={{
                      prefixes: ['habittracker://'],
                      config: {
                        screens: {
                          Home: 'home',
                          Habits: 'habits',
                          Statistics: 'statistics',
                          Profile: 'profile',
                          Settings: 'settings',
                        },
                      },
                    }}
                    fallback={<LoadingScreen />}
                    onReady={() => {
                      // Navigation is ready
                    }}
                  >
                    <StatusBar
                      barStyle={theme.dark ? 'light-content' : 'dark-content'}
                      backgroundColor="transparent"
                      translucent
                    />
                    <AppNavigator initialRoute={initialRoute} />
                  </NavigationContainer>
                </SafeAreaProvider>
              </PaperProvider>
            </HabitProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;