import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLectures } from "@/features/lectures/queries/useLectures";
import { LectureCard } from "@/components/ui/LectureCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { toCardData } from "@/features/lectures/types/lecture.types";
import { LectureSummary } from "@/lib/api/types";

export default function ExploreScreen() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage } =
    useLectures({});

  const lectures = data?.pages.flatMap((p) => p.data) ?? [];

  if (isError) return <ErrorState error={data} onRetry={refetch} />;

  return (
    <View className="flex-1 bg-background pt-4">
      <Text
        className="text-text text-xl font-semibold px-4 mb-3"
        accessibilityRole="header"
      >
        Explore
      </Text>
      <FlashList<LectureSummary>
        data={lectures}
        renderItem={({ item }) => <LectureCard data={toCardData(item)} />}
        // estimatedItemSize={96}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? <EmptyState message="No lectures found." /> : null
        }
      />
    </View>
  );
}
