import { Text, View } from "tamagui";

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
      <Text
        fontSize="$6"
        fontWeight="600"
        color="$mutedForeground"
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