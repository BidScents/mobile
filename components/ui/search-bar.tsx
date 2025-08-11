import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, Text, XStack, useTheme } from 'tamagui';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSearchPress?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
}

export function SearchBar({
  placeholder = "Search listings",
  onSearch,
  onSearchPress,
  autoFocus = false,
  editable = true,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const theme = useTheme();

  // Animated values
  const searchBarFlex = useSharedValue(1);
  const cancelButtonOpacity = useSharedValue(0);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    
    // Animate search bar to be shorter and show cancel button
    searchBarFlex.value = withSpring(0.99, { damping: 500 });
    cancelButtonOpacity.value = withTiming(1, { duration: 300 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Animate search bar back to full width and hide cancel button
    searchBarFlex.value = withSpring(1, { damping: 500 });
    cancelButtonOpacity.value = withTiming(0, { duration: 200 });
  };

  const handleCancel = () => {

    inputRef.current?.blur();
    setSearchQuery('');
    onSearch?.('');
  };

  const handleContainerPress = () => {
    if (editable) {
      inputRef.current?.focus();
    } else {
      onSearchPress?.();
    }
  };

  const handleSearchIconPress = () => {
    if (editable) {
      inputRef.current?.focus();
    } else {
      onSearchPress?.();
    }
  };

  // Animated styles
  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    flex: searchBarFlex.value,
  }));

  const cancelButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cancelButtonOpacity.value,
  }));

  const SearchInput = (
    <XStack
      alignItems="center"
      gap="$3"
      marginTop={insets.top}
      marginHorizontal="$4"
      flex={1}
      marginBottom="$2"
      width="100%"
    >
      <Animated.View style={searchBarAnimatedStyle}>
        <XStack
          alignItems="center"
          backgroundColor="$muted"
          borderRadius="$5"
          paddingHorizontal="$3"
          gap="$3"
          onPress={handleContainerPress}
          height={40}
        >
          <Pressable onPress={handleSearchIconPress}>
            <Ionicons 
              name="search" 
              size={20} 
              color={theme.foreground.val} 
            />
          </Pressable>
          <Input
            ref={inputRef}
            flex={1}
            placeholder={placeholder}
            placeholderTextColor={"$foreground"}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoFocus={autoFocus}
            editable={editable}
            backgroundColor="transparent"
            borderWidth={0}
            paddingHorizontal={0}
            fontSize="$5"
            returnKeyType="search"
            clearButtonMode="while-editing"
            onSubmitEditing={() => {
              inputRef.current?.blur();
            }}
          />
        </XStack>
      </Animated.View>

      {/* Animated Cancel Button */}
      <Animated.View style={[cancelButtonAnimatedStyle, { display: isFocused ? 'flex' : 'none' }]}>
        <Pressable onPress={handleCancel}>
          <Text color="$foreground" fontSize="$4">
            Cancel
          </Text>
        </Pressable>
      </Animated.View>
    </XStack>
  );

  if (!editable && onSearchPress) {
    return (
      <Pressable onPress={onSearchPress} style={{ flex: 1 }}>
        {SearchInput}
      </Pressable>
    );
  }

  return SearchInput;
}