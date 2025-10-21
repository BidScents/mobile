import React, { ReactNode, useEffect } from 'react';
import { Platform, View, ViewStyle, Keyboard, Dimensions } from 'react-native';
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
 const screenHeight = useSharedValue(Dimensions.get('window').height);
 
 useKeyboardHandler({
   onMove: (e) => {
     "worklet";
     height.value = Math.max(e.height, padding);
   },
 }, [padding]);

 useEffect(() => {
   const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
     height.value = Math.max(e.endCoordinates.height, padding);
   });

   const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
     height.value = padding;
   });

   const dimensionListener = Dimensions.addEventListener('change', ({ window }) => {
     const newScreenHeight = window.height;
     if (Math.abs(newScreenHeight - screenHeight.value) > 100) {
       screenHeight.value = newScreenHeight;
       if (newScreenHeight < screenHeight.value) {
         height.value = Math.max(screenHeight.value - newScreenHeight + padding, padding);
       }
     }
   });

   return () => {
     keyboardDidShowListener?.remove();
     keyboardDidHideListener?.remove();
     dimensionListener?.remove();
   };
 }, [height, padding, screenHeight]);
 
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