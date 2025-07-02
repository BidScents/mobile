import React, { ReactNode } from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const DEFAULT_PADDING = Platform.OS === 'ios' ? 20 : 0;

interface KeyboardAwareViewProps {
 children: ReactNode;
 backgroundColor?: string;
 keyboardPadding?: number;
 style?: ViewStyle;
}

const useKeyboardAnimation = (padding: number) => {
 const height = useSharedValue(padding);
 
 useKeyboardHandler({
   onMove: (e) => {
     "worklet";
     height.value = Math.max(e.height, padding);
   },
 }, [padding]);
 
 return { height };
};

export function KeyboardAwareView({
 children,
 backgroundColor = '$background',
 keyboardPadding = DEFAULT_PADDING,
 style,
}: KeyboardAwareViewProps) {
 const { height } = useKeyboardAnimation(keyboardPadding);
 
 const animatedBottomStyle = useAnimatedStyle(() => ({
   height: Math.abs(height.value),
   marginBottom: height.value > 0 ? 0 : keyboardPadding,
 }), [keyboardPadding]);

 const containerStyle: ViewStyle = {
   flex: 1,
   backgroundColor,
 };

 return (
   <View style={[containerStyle, style]}>
     {children}
     <Animated.View style={animatedBottomStyle} />
   </View>
 );
}