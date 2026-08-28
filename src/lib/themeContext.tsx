import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;   // hex color, e.g. "#1a1a2e"
  secondaryColor: string; // e.g. "#4f46e5"
  accentColor: string;    // e.g. "#f59e0b"
  backgroundColor: string;// e.g. "#0f172a"
  textColor: string;      // e.g. "#f1f5f9"
  borderColor: string;    // e.g. "#334155"
  fontFamily: string;     // e.g. "Inter, sans-serif"
}

interface ThemeContextType {
  theme: ThemeConfig;
  activeThemeId: string;
  selectTheme: (id: string) => void;
  updateTheme: (changes: Partial<ThemeConfig>) => Promise<void>;
  resetToDefault: () => void;
}

// ---------------------------------------------------------------------------
// React Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>({
    id: 'default',
    name: 'default',
    primaryColor: '#1a1a2e',
    secondaryColor: '#4f46e5',
    accentColor: '#f59e0b',
    backgroundColor: '#0f172a',
    textColor: '#f1f5f9',
    borderColor: '#334155',
    fontFamily: 'Inter, sans-serif',
  });

  const selectTheme = useCallback((id: string) => {
    setTheme(prev => (prev.id === id ? prev : { ...prev, id }));
  }, []);

  const updateTheme = useCallback(async (changes: Partial<ThemeConfig>) => {
    const db = supabase;
    const { data, error } = await db
      .from('theme_config')
      .update(changes)
      .select('id,name,primaryColor,secondaryColor,accentColor,backgroundColor,textColor,borderColor,fontFamily')
      .single();

    if (error) {
      console.error('Theme update failed:', error);
    }

    // Switch active theme
    setTheme(prev => ({ ...prev, ...changes }));
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultId = 'default';
    setTheme(prev => (prev.id === defaultId ? prev : { ...prev, id: defaultId }));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      activeThemeId: theme.id,
      selectTheme,
      updateTheme,
      resetToDefault,
    }),
    [theme, selectTheme, updateTheme, resetToDefault]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook for Consumers
// ---------------------------------------------------------------------------

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
