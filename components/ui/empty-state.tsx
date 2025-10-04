import { Text, View } from "tamagui";
import { ThemedIonicons } from "./themed-icons";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingHorizontal="$4"
      backgroundColor="$background"
    >
      <ThemedIonicons 
        name="receipt-outline" 
        size={64} 
        color={"$mutedForeground"} 
        style={{ marginBottom: 16 }} 
      />
      <Text
        fontSize="$6"
        fontWeight="600"
        color="$foreground"
        textAlign="center"
      >
        {title}
      </Text>
      <Text
        fontSize="$4"
        color="$mutedForeground"
        textAlign="center"
        marginTop="$2"
      >
        {description}
      </Text>
    </View>
  );
}