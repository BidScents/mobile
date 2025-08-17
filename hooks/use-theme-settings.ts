import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'app_theme_preference';

export const useThemeSettings = () => {
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
          const theme = savedTheme as ThemePreference;
          setThemePreference(theme);
          
          // Apply the saved theme immediately
          if (theme === 'system') {
            Appearance.setColorScheme(null); // Reset to system
          } else {
            Appearance.setColorScheme(theme); // Force light/dark
          }
        }
      } catch (error) {
        console.log('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference and apply immediately
  const setTheme = async (theme: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setThemePreference(theme);
      
      // Apply theme immediately using React Native's Appearance API
      if (theme === 'system') {
        Appearance.setColorScheme(null); // Reset to system theme
      } else {
        Appearance.setColorScheme(theme); // Force light or dark
      }

    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  return {
    themePreference,
    isLoading,
    setTheme,
  };
};