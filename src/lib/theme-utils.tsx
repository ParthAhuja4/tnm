import React, { useEffect, useState, useCallback, useMemo, createContext, useContext } from 'react';
import { storage } from './storage-utils';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';

interface Theme {
  mode: ThemeMode;
  color: ThemeColor;
  isDark: boolean;
}

const THEME_STORAGE_KEY = 'app_theme';
const DEFAULT_THEME: Theme = {
  mode: 'system',
  color: 'blue',
  isDark: false,
};

// CSS variables for theming
const COLOR_VARIABLES: Record<ThemeColor, Record<string, string>> = {
  blue: {
    '--primary': 'hsl(221, 83%, 53%)',
    '--primary-foreground': 'hsl(0, 0%, 100%)',
    '--primary-hover': 'hsl(221, 83%, 60%)',
    '--primary-light': 'hsl(214, 100%, 97%)',
    '--primary-dark': 'hsl(221, 83%, 45%)',
  },
  green: {
    '--primary': 'hsl(142, 71%, 45%)',
    '--primary-foreground': 'hsl(0, 0%, 100%)',
    '--primary-hover': 'hsl(142, 71%, 55%)',
    '--primary-light': 'hsl(142, 76%, 96%)',
    '--primary-dark': 'hsl(142, 71%, 35%)',
  },
  purple: {
    '--primary': 'hsl(262, 83%, 58%)',
    '--primary-foreground': 'hsl(0, 0%, 100%)',
    '--primary-hover': 'hsl(262, 83%, 65%)',
    '--primary-light': 'hsl(263, 100%, 98%)',
    '--primary-dark': 'hsl(262, 83%, 48%)',
  },
  orange: {
    '--primary': 'hsl(25, 95%, 53%)',
    '--primary-foreground': 'hsl(0, 0%, 100%)',
    '--primary-hover': 'hsl(25, 95%, 60%)',
    '--primary-light': 'hsl(25, 100%, 96%)',
    '--primary-dark': 'hsl(25, 95%, 43%)',
  },
  red: {
    '--primary': 'hsl(0, 84%, 60%)',
    '--primary-foreground': 'hsl(0, 0%, 100%)',
    '--primary-hover': 'hsl(0, 84%, 70%)',
    '--primary-light': 'hsl(0, 100%, 98%)',
    '--primary-dark': 'hsl(0, 84%, 50%)',
  },
  pink: {
    '--primary': 'hsl(330, 81%, 60%)',
    '--primary-foreground': 'hsl(0, 0%, 100%)',
    '--primary-hover': 'hsl(330, 81%, 70%)',
    '--primary-light': 'hsl(330, 100%, 98%)',
    '--primary-dark': 'hsl(330, 81%, 50%)',
  },
};

// Check if dark mode is preferred by the system
const prefersDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Apply theme to the document
export const applyTheme = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const isDark = theme.mode === 'system' ? prefersDarkMode() : theme.mode === 'dark';
  
  // Set color scheme
  root.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
  
  // Set theme class
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Apply color variables
  const colorVars = COLOR_VARIABLES[theme.color];
  Object.entries(colorVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Store theme in localStorage
  storage.set(THEME_STORAGE_KEY, theme);
};

// Get initial theme from storage or system preference
export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  const savedTheme = storage.get<Theme>(THEME_STORAGE_KEY);
  
  if (savedTheme) {
    const isDark = savedTheme.mode === 'system' 
      ? prefersDarkMode() 
      : savedTheme.mode === 'dark';
    
    return { ...savedTheme, isDark };
  }
  
  const isSystemDark = prefersDarkMode();
  return {
    ...DEFAULT_THEME,
    isDark: isSystemDark,
  };
};

// Hook to use theme
interface UseThemeReturn extends Theme {
  setThemeMode: (mode: ThemeMode) => void;
  setThemeColor: (color: ThemeColor) => void;
  toggleTheme: () => void;
  isLight: boolean;
  colors: ThemeColor[];
}

export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  
  // Update theme when it changes
  const updateTheme = useCallback((newTheme: Partial<Theme>) => {
    setTheme(prev => {
      const updatedTheme = { ...prev, ...newTheme };
      applyTheme(updatedTheme);
      return updatedTheme;
    });
  }, []);
  
  // Set theme mode (light/dark/system)
  const setThemeMode = useCallback((mode: ThemeMode) => {
    const isDark = mode === 'system' 
      ? prefersDarkMode() 
      : mode === 'dark';
    
    updateTheme({ mode, isDark });
  }, [updateTheme]);
  
  // Set theme color
  const setThemeColor = useCallback((color: ThemeColor) => {
    updateTheme({ color });
  }, [updateTheme]);
  
  // Toggle between light and dark mode
  const toggleTheme = useCallback(() => {
    const newMode = theme.mode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [theme.mode, setThemeMode]);
  
  // Apply theme on mount and when system preference changes
  useEffect(() => {
    applyTheme(theme);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme.mode === 'system') {
        updateTheme({ isDark: prefersDarkMode() });
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, updateTheme]);
  
  // Memoize colors array to prevent unnecessary re-renders
  const colors = useMemo(() => Object.keys(COLOR_VARIABLES) as ThemeColor[], []);
  
  return {
    ...theme,
    setThemeMode,
    setThemeColor,
    toggleTheme,
    isLight: !theme.isDark,
    colors,
  };
}

// Theme provider component
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultColor?: ThemeColor;
};

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  defaultColor = 'blue',
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = storage.get<Theme>(THEME_STORAGE_KEY);
    
    if (savedTheme) {
      const isDark = savedTheme.mode === 'system' 
        ? prefersDarkMode() 
        : savedTheme.mode === 'dark';
      
      return { ...savedTheme, isDark };
    }
    
    const isSystemDark = prefersDarkMode();
    return {
      mode: defaultTheme,
      color: defaultColor,
      isDark: defaultTheme === 'system' ? isSystemDark : defaultTheme === 'dark',
    };
  });
  
  // Apply theme on mount
  useEffect(() => {
    setMounted(true);
    applyTheme(theme);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme.mode === 'system') {
        const isDark = prefersDarkMode();
        setTheme(prev => ({
          ...prev,
          isDark,
        }));
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.mode]);
  
  // Update theme when it changes
  const updateTheme = useCallback((newTheme: Partial<Theme>) => {
    setTheme(prev => {
      const updatedTheme = { ...prev, ...newTheme };
      applyTheme(updatedTheme);
      return updatedTheme;
    });
  }, []);
  
  // Set theme mode (light/dark/system)
  const setThemeMode = useCallback((mode: ThemeMode) => {
    const isDark = mode === 'system' 
      ? prefersDarkMode() 
      : mode === 'dark';
    
    updateTheme({ mode, isDark });
  }, [updateTheme]);
  
  // Set theme color
  const setThemeColor = useCallback((color: ThemeColor) => {
    updateTheme({ color });
  }, [updateTheme]);
  
  // Toggle between light and dark mode
  const toggleTheme = useCallback(() => {
    const newMode = theme.mode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [theme.mode, setThemeMode]);
  
  // Memoize context value
  const contextValue = useMemo(() => ({
    ...theme,
    setThemeMode,
    setThemeColor,
    toggleTheme,
    isLight: !theme.isDark,
    colors: Object.keys(COLOR_VARIABLES) as ThemeColor[],
  }), [theme, setThemeMode, setThemeColor, toggleTheme]);
  
  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Create theme context
const ThemeContext = createContext<ReturnType<typeof useTheme> | undefined>(undefined);

// Hook to use theme context
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

// Higher-order component for class components
export function withTheme<P extends object>(
  WrappedComponent: React.ComponentType<P & { theme: ReturnType<typeof useTheme> }>
) {
  return function WithTheme(props: P) {
    const theme = useThemeContext();
    return <WrappedComponent {...props} theme={theme} />;
  };
}

// Utility function to get theme color CSS variables
export function getThemeColorVariables(color: ThemeColor): Record<string, string> {
  return COLOR_VARIABLES[color] || COLOR_VARIABLES.blue;
}

// Utility function to get all available theme colors
export function getAvailableThemeColors(): ThemeColor[] {
  return Object.keys(COLOR_VARIABLES) as ThemeColor[];
}

// Utility function to get the current theme
// This can be used outside of React components
export function getCurrentTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  const savedTheme = storage.get<Theme>(THEME_STORAGE_KEY);
  if (savedTheme) return savedTheme;
  
  return {
    ...DEFAULT_THEME,
    isDark: prefersDarkMode(),
  };
}
