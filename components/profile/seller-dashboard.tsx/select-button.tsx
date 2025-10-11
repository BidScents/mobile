import * as Haptics from 'expo-haptics';
import { Text, XStack } from "tamagui";

interface SelectButtonProps {
  isSelectMode: boolean;
  onPress: () => void;
}

export function SelectButton({ isSelectMode, onPress }: SelectButtonProps) {
  const getButtonText = () => {
    if (!isSelectMode) {
      return "Select";
    } else {
      return "Cancel";
    }
  };

  const handlePress = () => {
    onPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <XStack 
      backgroundColor="$muted"
      py="$1.5" 
      px="$2" 
      borderRadius="$5"
      onPress={handlePress}
      pressStyle={{ scale: 0.95 }}
    >
      <Text 
        color="$foreground" 
        fontWeight="600" 
        fontSize="$3"
      >
        {getButtonText()}
      </Text>
    </XStack>
  );
}