import { useOrders } from "@/hooks/queries/use-orders";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { Text, View } from "tamagui";

export default function PendingView() {
    const {data, isLoading, error} = useOrders('pending')
    console.log(data?.pages)
    const {session} = useAuthStore()
    console.log(session)
  return (
    <View>
      <Text>Pending Tab Content</Text>
    </View>
  );
}
