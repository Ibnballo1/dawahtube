import { View, Text } from "react-native";
import { useNetworkStatus } from "@/lib/network/useNetworkStatus";

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  if (isConnected) return null;
  return (
    <View
      className="bg-gold py-1 items-center"
      accessibilityLiveRegion="polite"
    >
      <Text className="text-background text-xs font-medium">
        You&apos;re offline — showing downloaded content
      </Text>
    </View>
  );
}
