import React from "react";
import { ShowMoreText } from "../ui/show-more-text";

interface ProfileBioProps {
  bio?: string | null;
}

export const ProfileBio: React.FC<ProfileBioProps> = ({ bio }) => {
  if (!bio) return null;

  return (
    <ShowMoreText
      lines={3}
      more="Show more"
      less="Show less"
      fontSize="$5"
      color="$foreground"
      fontWeight="400"
      buttonColor="$blue10"
    >
      {bio}
    </ShowMoreText>
  );
};
