import { useOrders } from "@/hooks/queries/use-orders";
import { Text, View } from "tamagui";

export default function CompletedView() {
    const {data, isLoading, error, isFetching} = useOrders('completed')
    console.log(data?.pages[0].orders)
    console.log(isLoading,isFetching)
  return (
    <View>
      <Text>Completed Tab Content</Text>
    </View>
  );
}
