import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const INTRO_KEY = 'has_seen_intro_v1';

export function useIntro() {
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkIntro();
  }, []);

  const checkIntro = async () => {
    try {
      const value = await AsyncStorage.getItem(INTRO_KEY);
      setHasSeenIntro(value === 'true');
    } catch (error) {
      console.log('Error checking intro status:', error);
      setHasSeenIntro(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markIntroSeen = async () => {
    try {
      await AsyncStorage.setItem(INTRO_KEY, 'true');
      setHasSeenIntro(true);
    } catch (error) {
      console.log('Error saving intro status:', error);
    }
  };

  const resetIntro = async () => {
    try {
      await AsyncStorage.removeItem(INTRO_KEY);
      setHasSeenIntro(false);
    } catch (error) {
      console.log('Error resetting intro status:', error);
    }
  };

  return {
    hasSeenIntro,
    isLoading,
    markIntroSeen,
    resetIntro,
  };
}
