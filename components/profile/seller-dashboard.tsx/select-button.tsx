import * as Haptics from 'expo-haptics';
import { Text, XStack } from "tamagui";

interface SelectButtonProps {
  isSelectMode: boolean;
  selectedCount: number;
  onPress: () => void;
}

export function SelectButton({ isSelectMode, selectedCount, onPress }: SelectButtonProps) {
  const getButtonText = () => {
    if (!isSelectMode) {
      return "Select";
    } else if (selectedCount === 0) {
      return "Cancel";
    } else {
      return `Boost (${selectedCount})`;
    }
  };

  const getVariant = () => {
    if (!isSelectMode) {
      return "$muted"; // Default state
    } else if (selectedCount === 0) {
      return "$muted"; // Cancel state
    } else {
      return "$blue11"; // Boost state with accent color
    }
  };

  const handlePress = () => {
    onPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <XStack 
      backgroundColor={getVariant()}
      py="$1.5" 
      px="$2" 
      borderRadius="$5"
      onPress={handlePress}
      pressStyle={{ scale: 0.95 }}
    >
      <Text 
        color={selectedCount > 0 ? "$background" : "$foreground"} 
        fontWeight="600" 
        fontSize="$3"
      >
        {getButtonText()}
      </Text>
    </XStack>
  );
}