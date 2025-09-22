import RequiresOnboarding from "@/components/payments/requires-onboarding";
import SellerDashboardTabs from "@/components/profile/seller-dashboard.tsx/seller-dashboard-tabs";
import { Container } from "@/components/ui/container";

export default function SellerDashboardScreen() {
  return (
    <Container variant="fullscreen" safeArea={false} backgroundColor="$background">
      <RequiresOnboarding />
      <SellerDashboardTabs />
    </Container>
  );
}
