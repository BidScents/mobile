import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Pressable, TextInput } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Input, Text, XStack } from 'tamagui';
import { ThemedIonicons } from './themed-icons';

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSubmitEditing: () => void;
  onSearchIconPress: () => void;
  onCancel: () => void;
  autoFocus: boolean;
  editable: boolean;
  searchBarFlex: SharedValue<number>;
  cancelButtonOpacity: SharedValue<number>;
  isFocused: boolean;
  backgroundColor?: string;
  height: number;
}

export function SearchInput({
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  onSubmitEditing,
  onSearchIconPress,
  onCancel,
  autoFocus,
  editable,
  searchBarFlex,
  cancelButtonOpacity,
  isFocused,
  backgroundColor = '$muted',
  height,
}: SearchInputProps) {
  const inputRef = useRef<TextInput>(null);

  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    flex: searchBarFlex.value,
  }));

  const cancelButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cancelButtonOpacity.value,
  }));

  const handleContainerPress = () => {
    if (editable) {
      inputRef.current?.focus();
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    inputRef.current?.blur();
    onCancel();
  };

  const handleSubmitEditing = () => {
    inputRef.current?.blur();
    onSubmitEditing();
  };

  return (
    <>
      <Animated.View style={searchBarAnimatedStyle}>
        <XStack
          alignItems="center"
          backgroundColor={backgroundColor}
          borderRadius="$6"
          paddingHorizontal="$3"
          gap="$3"
          onPress={handleContainerPress}
          height={height}
        >
          <Pressable onPress={onSearchIconPress}>
            <ThemedIonicons 
              name="search" 
              size={20} 
            />
          </Pressable>
          <Input
            ref={inputRef}
            flex={1}
            placeholder={placeholder}
            placeholderTextColor="$foreground"
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onBlur={onBlur}
            autoFocus={autoFocus}
            editable={editable}
            backgroundColor="transparent"
            borderWidth={0}
            paddingHorizontal={0}
            fontSize="$5"
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
            onSubmitEditing={handleSubmitEditing}
          />
        </XStack>
      </Animated.View>

      <Animated.View style={[cancelButtonAnimatedStyle, { display: isFocused ? 'flex' : 'none' }]}>
        <Pressable onPress={handleCancel} hitSlop={20}>
          <Text color="$foreground" fontSize="$4">
            Cancel
          </Text>
        </Pressable>
      </Animated.View>
    </>
  );
}