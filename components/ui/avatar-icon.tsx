import { Ionicons } from "@expo/vector-icons";
import { Avatar, useTheme } from "tamagui";

export function AvatarIcon({
  url,
  size,
  onClick,
}: {
  url: string | null | undefined;
  size: string;
  onClick?: () => void;
}) {
  const theme = useTheme();
  return (
    <Avatar circular size={size} onPress={onClick}>
      {url && url.trim() !== "" ? (
        <Avatar.Image
          source={{
            uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${url}`,
          }}
          onError={() => console.log("Avatar image failed to load")}
        />
      ) : null}
      <Avatar.Fallback
        backgroundColor="$foreground"
        justifyContent="center"
        alignItems="center"
      >
        <Ionicons name="person" size={22} color={theme.background?.get()} />
      </Avatar.Fallback>
    </Avatar>
  );
}
