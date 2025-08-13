import { useSearchBarAnimation } from '@/hooks/use-search-bar-animation';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack } from 'tamagui';
import { SearchInput } from './search-input';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  onSearchPress?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  navigateToResults?: boolean;
  initialFilters?: any;
  initialSort?: any;
  initialValue?: string;
  includeSafeArea?: boolean;
}

export const SEARCH_BAR_HEIGHT = 40;
export const SEARCH_BAR_PADDING = 16;

export const getSearchBarTotalHeight = (safeAreaTop: number, includeSafeArea: boolean = true) => {
  return SEARCH_BAR_HEIGHT + (SEARCH_BAR_PADDING * 2) + (includeSafeArea ? safeAreaTop : 0);
};

export function SearchBar({
  placeholder = "Search listings",
  onSearch,
  onSearchSubmit,
  onSearchPress,
  autoFocus = false,
  editable = true,
  navigateToResults = false,
  initialFilters,
  initialSort,
  initialValue = '',
  includeSafeArea = true,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const insets = useSafeAreaInsets();
  
  const { searchBarFlex, cancelButtonOpacity, animateToFocused, animateToBlurred } = useSearchBarAnimation();

  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    animateToFocused();
  };

  const handleBlur = () => {
    setIsFocused(false);
    animateToBlurred();
  };

  const handleSearchIconPress = () => {
    if (editable && navigateToResults && searchQuery.trim()) {
      handleSearchSubmit();
    } else if (editable && onSearchSubmit && searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    } else {
      onSearchPress?.();
    }
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim() || !navigateToResults) return;
    
    const params = new URLSearchParams();
    params.append('q', searchQuery.trim());
    
    if (initialFilters) {
      params.append('filters', JSON.stringify(initialFilters));
    }
    
    if (initialSort) {
      params.append('sort', JSON.stringify(initialSort));
    }
    
    router.push(`/(tabs)/home/search-results?${params.toString()}` as any);
  };

  const handleSubmitEditing = () => {
    if (navigateToResults) {
      handleSearchSubmit();
    } else if (onSearchSubmit && searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
    // Blur is handled by SearchInput component when needed
  };

  const SearchInputContent = (
    <XStack
      alignItems="center"
      gap="$3"
      marginTop={includeSafeArea ? insets.top : 0}
      flex={1}
    >
      <SearchInput
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={handleSearchChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmitEditing}
        onSearchIconPress={handleSearchIconPress}
        onCancel={() => {}}
        autoFocus={autoFocus}
        editable={editable}
        searchBarFlex={searchBarFlex}
        cancelButtonOpacity={cancelButtonOpacity}
        isFocused={isFocused}
        backgroundColor="$muted"
        height={SEARCH_BAR_HEIGHT}
      />
    </XStack>
  );

  if (!editable && onSearchPress) {
    return (
      <Pressable onPress={onSearchPress} style={{ flex: 1 }}>
        {SearchInputContent}
      </Pressable>
    );
  }

  return SearchInputContent;
}