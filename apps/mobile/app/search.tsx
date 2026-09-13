import { useState } from "react";
import { View, TextInput } from "react-native";
import { useSearch } from "@/features/search/queries/useSearch";
import { LectureCard } from "@/components/ui/LectureCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { toCardData } from "@/features/search/types/search.types";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useSearch({ q: query });

  // Extract the array of items directly (.items instead of .lectures)
  const lectures = data?.lectures?.items ?? [];

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

      {query.trim().length > 1 && !isLoading && lectures.length === 0 && (
        <EmptyState message={`No results for "${query}"`} />
      )}

      {lectures.map((lecture) => (
        <LectureCard key={lecture.id} data={toCardData(lecture)} />
      ))}
    </View>
  );
}
