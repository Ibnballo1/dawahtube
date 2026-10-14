import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { useSearch } from "@/features/search/queries/useSearch";
import { toCardData } from "@/features/search/types/search.types";
import { LectureCard } from "@/components/ui/LectureCard";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { DEFAULT_IMAGES } from "@/lib/assets/defaultImages";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useSearch({ q: query });
  const hasQuery = query.trim().length > 1;

  return (
    <View className="flex-1 bg-background pt-4">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search lectures, scholars, series"
        placeholderTextColor="#94A3B8"
        accessibilityLabel="Search"
        className="mx-4 bg-card text-text rounded-full px-4 py-3"
      />
      {hasQuery && !isLoading && data?.total === 0 && (
        <EmptyState message={`No results for "${query}"`} />
      )}
      {data && data.scholars.length > 0 && (
        <View className="mb-2">
          <Text className="text-muted text-xs px-4 mb-1">Scholars</Text>
          {data.scholars.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => router.push(`/scholar/${s.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={s.displayName}
              className="flex-row items-center px-4 py-2"
            >
              <ArtworkImage
                source={s.avatar}
                fallback={DEFAULT_IMAGES.scholar}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
              <Text className="text-text ml-3">{s.displayName}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {data && data.series.length > 0 && (
        <View className="mb-2">
          <Text className="text-muted text-xs px-4 mb-1">Series</Text>
          {data.series.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => router.push(`/series/${s.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={s.title}
              className="flex-row items-center px-4 py-2"
            >
              <ArtworkImage
                source={s.thumbnail}
                fallback={DEFAULT_IMAGES.series}
                style={{ width: 36, height: 36, borderRadius: 6 }}
              />
              <Text className="text-text ml-3">{s.title}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {data && data.lectures.length > 0 && (
        <Text className="text-muted text-xs px-4 mb-1">Lectures</Text>
      )}
      {data?.lectures.map((hit) => (
        <LectureCard key={hit.id} data={toCardData(hit)} />
      ))}
    </View>
  );
}
