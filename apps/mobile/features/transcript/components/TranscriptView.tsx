import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { parseTranscript } from "../parser/parseTranscript";
import type { TranscriptLine } from "../types/transcript.types";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatTime } from "@/lib/format/time";

interface Props {
  raw: string | null;
  currentPositionSecs: number;
  onSeek: (secs: number) => void;
}

export function TranscriptView({ raw, currentPositionSecs, onSeek }: Props) {
  const [query, setQuery] = useState("");

  // 1. Fix: Use FlashListRef<T> for ref typing
  const listRef = useRef<FlashListRef<TranscriptLine>>(null);
  const result = useMemo(() => parseTranscript(raw), [raw]);

  const activeIndex = useMemo(() => {
    if (!result || result.kind !== "timestamped") return -1;
    let idx = -1;

    // 2. Fix: Safely access result.lines with optional chaining / local reference
    const lines = result.lines ?? [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line && line.timestampSeconds <= currentPositionSecs) idx = i;
      else break;
    }
    return idx;
  }, [result, currentPositionSecs]);

  useEffect(() => {
    if (!query && activeIndex >= 0) {
      try {
        listRef.current?.scrollToIndex({
          index: activeIndex,
          animated: true,
          viewPosition: 0.3,
        });
      } catch {
        // out-of-range on a very short list — harmless, ignore
      }
    }
  }, [activeIndex, query]);

  if (!result)
    return <EmptyState message="No transcript available for this lecture." />;

  if (result.kind === "plain") {
    return (
      <View className="flex-1 p-4">
        <Text className="text-text leading-6">{result.text}</Text>
      </View>
    );
  }

  // Safely grab lines once TypeScript narrows timestamped kind
  const lines = result.lines ?? [];

  // 3. Fix: Optional chain l.text?.toLowerCase() or fallback to ""
  const filtered = query.trim()
    ? lines.filter((l) =>
        (l.text ?? "").toLowerCase().includes(query.toLowerCase()),
      )
    : lines;

  return (
    <View className="flex-1">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search transcript"
        placeholderTextColor="#94A3B8"
        accessibilityLabel="Search transcript"
        className="mx-4 mb-2 bg-card text-text rounded-full px-4 py-2"
      />
      <FlashList
        ref={listRef}
        data={filtered}
        keyExtractor={(item, i) => `${item.timestampSeconds}-${i}`}
        renderItem={({ item }) => {
          const isActive =
            !query && activeIndex >= 0 && lines[activeIndex] === item;
          return (
            <Pressable
              onPress={() => onSeek(item.timestampSeconds)}
              accessibilityRole="button"
              accessibilityLabel={`Jump to ${formatTime(item.timestampSeconds)}: ${item.text ?? ""}`}
              className={`px-4 py-2 ${isActive ? "bg-card" : ""}`}
            >
              <Text
                className={
                  isActive
                    ? "text-gold text-xs font-medium mb-0.5"
                    : "text-muted text-xs mb-0.5"
                }
              >
                {formatTime(item.timestampSeconds)}
              </Text>
              <Text className={isActive ? "text-text" : "text-muted"}>
                {item.text}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
