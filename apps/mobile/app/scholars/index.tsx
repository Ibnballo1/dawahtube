import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useScholars } from "@/features/scholars/queries/useScholars";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

export default function ScholarsScreen() {
  const {
    data,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useScholars({});
  const scholars = data?.pages.flatMap((p) => p.data) ?? [];

  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <View className="flex-1 bg-background pt-4">
      <Text
        className="text-text text-xl font-semibold px-4 mb-3"
        accessibilityRole="header"
      >
        Scholars
      </Text>
      <FlashList
        data={scholars}
        // estimatedItemSize={72}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? <EmptyState message="No scholars found." /> : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/scholar/${item.slug}`)}
            accessibilityRole="button"
            accessibilityLabel={item.displayName}
            className="flex-row items-center bg-card rounded-xl p-3 mb-3 mx-4"
          >
            <Image
              source={item.avatar}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#0F172A",
              }}
            />
            <Text className="text-text ml-3">{item.displayName}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
