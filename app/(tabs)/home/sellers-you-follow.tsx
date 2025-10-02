import { SellersYouFollowList } from "@/components/sellers-you-follow/sellers-you-follow-list";
import { Container } from "@/components/ui/container";

export default function SellersYouFollowScreen() {
  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      {/* Sellers You Follow Results */}
      <SellersYouFollowList />
    </Container>
  );
}