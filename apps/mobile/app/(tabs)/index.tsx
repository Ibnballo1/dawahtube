import { ScrollView, View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useHistoryStore } from "@/features/history/store/historyStore";
import { useLectures } from "@/features/lectures/queries/useLectures";
import { useSeriesList } from "@/features/series/queries/useSeries";
import { useFeatured } from "@/features/reminders/queries/useFeatured";
import { LectureCard } from "@/components/ui/LectureCard";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { DEFAULT_IMAGES } from "@/lib/assets/defaultImages";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { toCardData } from "@/features/lectures/types/lecture.types";
import {
  toArray,
  featuredLectureToCardData,
  featuredScholarToCardData,
} from "@/features/lectures/types/featured.types";
import { DailyReminderCard } from "@/features/reminders/components/DailyReminderCard";

export default function HomeScreen() {
  const historyEntries = useHistoryStore((s) => s.entries);
  const featured = useFeatured();
  const recent = useLectures({ sort: "recent", limit: 5 });
  const series = useSeriesList({ limit: 6 });

  const continueListening = Object.values(historyEntries)
    .filter((e) => !e.completed && e.positionSecs > 10)
    .sort(
      (a, b) =>
        new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime(),
    )
    .slice(0, 5);

  const heroLecture = toArray(featured.data?.hero_lecture)[0];
  const featuredLectures = toArray(featured.data?.featured_lectures);
  const featuredScholars = toArray(featured.data?.featured_scholars);
  const dailyReminder = toArray(featured.data?.daily_reminder)[0];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingVertical: 16 }}
    >
      {continueListening.length > 0 && (
        <>
          <SectionHeader title="Continue Listening" />
          {continueListening.map((entry) => (
            <LectureCard
              key={entry.lectureId}
              data={{
                id: entry.lectureId,
                title: entry.title,
                scholarName: entry.scholarName,
                thumbnailUrl: entry.artworkUrl,
                durationSecs: entry.durationSecs,
                allowDownload: false,
              }}
            />
          ))}
          <View className="h-4" />
        </>
      )}

      {dailyReminder && (
        <>
          <DailyReminderCard reminder={dailyReminder} />
          <View className="h-4" />
        </>
      )}

      {heroLecture && (
        <>
          <Pressable
            onPress={() => router.push(`/lecture/${heroLecture.id}`)}
            accessibilityRole="button"
            accessibilityLabel={heroLecture.title}
            className="mx-4 mb-4 rounded-xl overflow-hidden"
          >
            <ArtworkImage
              source={heroLecture.thumbnail}
              fallback={DEFAULT_IMAGES.lecture}
              style={{ width: "100%", height: 180 }}
              contentFit="cover"
            />
            <View className="bg-card p-3">
              <Text
                className="text-text text-lg font-semibold"
                numberOfLines={2}
              >
                {heroLecture.title}
              </Text>
              {heroLecture.scholar && (
                <Text className="text-muted text-sm mt-1">
                  {heroLecture.scholar.displayName}
                </Text>
              )}
            </View>
          </Pressable>
        </>
      )}

      <SectionHeader
        title="Featured Lectures"
        onSeeAll={() => router.push("/(tabs)/explore")}
      />
      {featured.isError ? (
        <ErrorState error={featured.error} onRetry={featured.refetch} />
      ) : featuredLectures.length === 0 && !featured.isLoading ? (
        <EmptyState message="No featured lectures right now." />
      ) : (
        featuredLectures.map((lecture) => (
          <LectureCard
            key={lecture.id}
            data={featuredLectureToCardData(lecture)}
          />
        ))
      )}

      <View className="h-4" />

      <SectionHeader
        title="Recently Added"
        onSeeAll={() => router.push("/(tabs)/explore")}
      />
      {recent.isError ? (
        <ErrorState error={recent.error} onRetry={recent.refetch} />
      ) : (
        (recent.data?.pages.flatMap((p) => p.data) ?? []).map((lecture) => (
          <LectureCard key={lecture.id} data={toCardData(lecture)} />
        ))
      )}

      <View className="h-4" />

      <SectionHeader
        title="Featured Scholars"
        onSeeAll={() => router.push("/scholars")}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4"
      >
        {featuredScholars.map((scholar) => {
          const data = featuredScholarToCardData(scholar);
          return (
            <Pressable
              key={data.id}
              onPress={() => router.push(`/scholar/${data.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={data.displayName}
              className="mr-4 items-center w-20"
            >
              <ArtworkImage
                source={scholar.avatar}
                fallback={DEFAULT_IMAGES.scholar}
                style={{ width: 56, height: 56, borderRadius: 28 }}
              />
              <Text
                className="text-muted text-xs mt-1 text-center"
                numberOfLines={2}
              >
                {data.displayName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="h-4" />

      <SectionHeader title="Series" onSeeAll={() => router.push("/series")} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4"
      >
        {(series.data?.pages.flatMap((p) => p.data) ?? []).map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push(`/series/${s.slug}`)}
            accessibilityRole="button"
            accessibilityLabel={s.title}
            className="mr-4 w-32"
          >
            <ArtworkImage
              source={s.thumbnail}
              fallback={DEFAULT_IMAGES.series}
              style={{ width: 100, height: 100, borderRadius: 10 }}
            />
            <Text className="text-text text-sm mt-1" numberOfLines={2}>
              {s.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </ScrollView>
  );
}
