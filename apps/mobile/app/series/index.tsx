import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useSeriesList } from "@/features/series/queries/useSeries";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { DEFAULT_IMAGES } from "@/lib/assets/defaultImages";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

export default function SeriesListScreen() {
  const {
    data,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useSeriesList({});
  const items = data?.pages.flatMap((p) => p.data) ?? [];

  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <View className="flex-1 bg-background pt-4">
      <Text
        className="text-text text-xl font-semibold px-4 mb-3"
        accessibilityRole="header"
      >
        Series
      </Text>
      <FlashList
        data={items}
        // estimatedItemSize={80}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? <EmptyState message="No series found." /> : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/series/${item.slug}`)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            className="flex-row items-center bg-card rounded-xl p-3 mb-3 mx-4"
          >
            <ArtworkImage
              source={item.thumbnail}
              fallback={DEFAULT_IMAGES.series}
              style={{ width: 56, height: 56, borderRadius: 8 }}
            />
            <View className="flex-1 ml-3">
              <Text className="text-text" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-muted text-xs mt-1">
                {item.lectureCount} lectures
                {item.scholar ? ` · ${item.scholar.displayName}` : ""}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
