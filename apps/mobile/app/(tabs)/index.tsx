import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useLectures } from "@/features/lectures/queries/useLectures";
import { useScholars } from "@/features/scholars/queries/useScholars";
import { LectureCard } from "@/components/ui/LectureCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { toCardData } from "@/features/lectures/types/lecture.types";
import { ErrorState } from "@/components/ui/ErrorState";
import { useEffect } from "react";

export default function HomeScreen() {
  const featured = useLectures({ sort: "popular", limit: 5 });
  const recent = useLectures({ sort: "recent", limit: 5 });
  const scholars = useScholars({ limit: 8 });

  if (featured.isError)
    return <ErrorState error={featured.error} onRetry={featured.refetch} />;

  const featuredLectures = featured.data?.pages.flatMap((p) => p.data) ?? [];
  const recentLectures = recent.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingVertical: 16 }}
    >
      <SectionHeader
        title="Featured Lectures"
        onSeeAll={() => router.push("/(tabs)/explore")}
      />
      {featuredLectures.length === 0 && !featured.isLoading ? (
        <EmptyState message="No featured lectures yet." />
      ) : (
        featuredLectures.map((lecture) => (
          <LectureCard key={lecture.id} data={toCardData(lecture)} />
        ))
      )}

      <View className="h-4" />

      <SectionHeader
        title="Recently Added"
        onSeeAll={() => router.push("/(tabs)/explore")}
      />
      {recentLectures.map((lecture) => (
        <LectureCard key={lecture.id} data={toCardData(lecture)} />
      ))}

      <View className="h-4" />

      <SectionHeader
        title="Browse Scholars"
        onSeeAll={() => router.push("/scholars")}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4"
      >
        {(scholars.data?.pages.flatMap((p) => p.data) ?? []).map((scholar) => (
          <Pressable
            key={scholar.id}
            onPress={() => router.push(`/scholar/${scholar.slug}`)}
            accessibilityRole="button"
            accessibilityLabel={scholar.displayName}
            className="mr-4 items-center w-20"
          >
            <Image
              source={scholar.avatar}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#1E293B",
              }}
            />
            <Text
              className="text-muted text-xs mt-1 text-center"
              numberOfLines={2}
            >
              {scholar.displayName}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </ScrollView>
  );
}
