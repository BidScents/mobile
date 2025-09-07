import RequiresOnboarding from "@/components/payments/requires-onboarding";
import { Container } from "@/components/ui/container";

export default function SellerDashboardScreen() {
  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      <RequiresOnboarding />
    </Container>
  );
}
