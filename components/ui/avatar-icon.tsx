import { ThemedIonicons } from "./themed-icons";
import { Avatar } from "tamagui";
import { useThemeColors } from '../../hooks/use-theme-colors';

export function AvatarIcon({
  url,
  size,
  onClick,
}: {
  url: string | null | undefined;
  size: string;
  onClick?: () => void;
}) {
  const colors = useThemeColors();
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
        <ThemedIonicons name="person" size={22} color={colors.background} />
      </Avatar.Fallback>
    </Avatar>
  );
}
