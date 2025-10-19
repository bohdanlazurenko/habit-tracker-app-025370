import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import HomeScreen from '@/screens/HomeScreen';
import HabitListScreen from '@/screens/HabitListScreen';
import StatisticsScreen from '@/screens/StatisticsScreen';
import ProfileScreen from '@/screens/ProfileScreen';

interface NavigationItem {
  id: string;
  path: string;
  label: string;
  icon: string;
  component: React.ComponentType;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    path: '/',
    label: 'Home',
    icon: '🏠',
    component: HomeScreen,
  },
  {
    id: 'habits',
    path: '/habits',
    label: 'Habits',
    icon: '✅',
    component: HabitListScreen,
  },
  {
    id: 'statistics',
    path: '/statistics',
    label: 'Statistics',
    icon: '📊',
    component: StatisticsScreen,
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'Profile',
    icon: '👤',
    component: ProfileScreen,
  },
];

export default function AppNavigator() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Update active tab based on current pathname
  useEffect(() => {
    const currentItem = navigationItems.find(item => item.path === pathname);
    if (currentItem) {
      setActiveTab(currentItem.id);
    }
  }, [pathname]);

  // Handle navigation with loading state
  const handleNavigation = async (path: string, itemId: string) => {
    if (isNavigating || itemId === activeTab) return;
    
    setIsNavigating(true);
    try {
      await router.push(path);
      setActiveTab(itemId);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  // Get the active component based on current path
  const ActiveComponent = navigationItems.find(item => item.id === activeTab)?.component || HomeScreen;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <ActiveComponent />
        </div>
      </main>

      {/* Bottom navigation bar */}
      <nav 
        role="navigation" 
        aria-label="Main navigation"
        className="bg-white border-t border-gray-200 shadow-lg"
      >
        <ul className="flex justify-around items-center py-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item.path, item.id)}
                disabled={isNavigating}
                className={`
                  flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200
                  ${activeTab === item.id 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                  ${isNavigating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
                aria-current={activeTab === item.id ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
              >
                <span className="text-2xl mb-1" aria-hidden="true">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Loading overlay for navigation */}
      {isNavigating && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50"
          aria-hidden="true"
        >
          <div className="bg-white rounded-lg p-4 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}
    </div>
  );
}