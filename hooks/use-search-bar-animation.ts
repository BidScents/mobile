import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useCallback } from 'react';

/**
 * Hook to manage search bar animation state and transitions
 */
export const useSearchBarAnimation = () => {
  const searchBarFlex = useSharedValue(1);
  const cancelButtonOpacity = useSharedValue(0);

  const animateToFocused = useCallback(() => {
    searchBarFlex.value = withSpring(0.99, { damping: 500 });
    cancelButtonOpacity.value = withTiming(1, { duration: 300 });
  }, [searchBarFlex, cancelButtonOpacity]);

  const animateToBlurred = useCallback(() => {
    searchBarFlex.value = withSpring(1, { damping: 500 });
    cancelButtonOpacity.value = withTiming(0, { duration: 200 });
  }, [searchBarFlex, cancelButtonOpacity]);

  return {
    searchBarFlex,
    cancelButtonOpacity,
    animateToFocused,
    animateToBlurred,
  };
};