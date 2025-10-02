import { ThemedIonicons } from "@/components/ui/themed-icons";
import { TouchableOpacity } from "react-native";

interface SendButtonProps {
  hasContent: boolean;
  isLoading: boolean;
  onPress: () => void;
}

export const SendButton = ({ hasContent, isLoading, onPress }: SendButtonProps) => {
  if (!hasContent) return null;

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{ 
        opacity: isLoading ? 0.6 : 1,
        transform: [{ scale: 0.93 }]
      }}
      disabled={isLoading}
    >
      <ThemedIonicons 
        name={isLoading ? "hourglass-outline" : "send"} 
        size={28} 
      />
    </TouchableOpacity>
  );
};