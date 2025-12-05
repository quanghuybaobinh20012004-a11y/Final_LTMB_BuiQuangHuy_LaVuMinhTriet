// src/theme/ThemeProvider.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

type ThemeColors = {
  primary: string;
  onPrimary: string;
  bg: string;
  bgSoft: string;
  card: string;
  text: string;
  subtext: string;
  outline: string;
};

type ThemeSettings = {
  mode: 'light' | 'dark';
  primary: string;
};

type ThemeContextType = {
  colors: ThemeColors;
  settings: ThemeSettings;
  setMode: (mode: 'light' | 'dark') => void;
  setPrimary: (hex: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const baseLight: ThemeColors = {
  primary: '#2E7D32',
  onPrimary: '#FFFFFF',
  bg: '#FFFFFF',
  bgSoft: '#F5F5F5',
  card: '#FFFFFF',
  text: '#111827',
  subtext: '#6B7280',
  outline: '#E5E7EB',
};

const baseDark: ThemeColors = {
  primary: '#4ADE80',
  onPrimary: '#000000',
  bg: '#020617',
  bgSoft: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  subtext: '#9CA3AF',
  outline: '#374151',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const initialMode: 'light' | 'dark' =
    systemScheme === 'dark' ? 'dark' : 'light';

  const [mode, setMode] = useState<'light' | 'dark'>(initialMode);
  const [primary, setPrimary] = useState<string>(baseLight.primary);

  // Tính colors dựa trên mode + primary
  const colors = useMemo<ThemeColors>(() => {
    const base = mode === 'dark' ? baseDark : baseLight;
    return { ...base, primary };
  }, [mode, primary]);

  const settings: ThemeSettings = { mode, primary };

  const value = useMemo(
    () => ({
      colors,
      settings,
      setMode,
      setPrimary,
    }),
    [colors, settings]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return ctx;
}
