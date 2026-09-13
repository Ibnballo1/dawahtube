import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useDownloads } from "@/features/downloads/hooks/useDownloads";
import { DownloadButton } from "@/features/downloads/components/DownloadButton";
import { EmptyState } from "@/components/ui/EmptyState";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
}

export default function DownloadsScreen() {
  const { records, progress, totalStorageBytes } = useDownloads();

  return (
    <View className="flex-1 bg-background pt-4">
      <Text
        className="text-text text-xl font-semibold px-4"
        accessibilityRole="header"
      >
        Downloads
      </Text>
      <Text className="text-muted px-4 mt-1 mb-3">
        {formatBytes(totalStorageBytes)} used
      </Text>

      <FlashList
        data={records}
        keyExtractor={(r) => r.lectureId}
        ListEmptyComponent={<EmptyState message="No downloads yet." />}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-card rounded-xl p-3 mb-3 mx-4">
            <Image
              source={item.artworkUrl}
              style={{ width: 56, height: 56, borderRadius: 8 }}
            />
            <View className="flex-1 ml-3">
              <Text className="text-text" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-muted text-xs mt-1">
                {item.status === "downloading" || item.status === "queued"
                  ? `Downloading… ${Math.round((progress[item.lectureId] ?? 0) * 100)}%`
                  : item.status === "paused"
                    ? "Paused"
                    : item.status === "failed"
                      ? "Failed — tap to retry"
                      : formatBytes(item.fileSizeBytes)}
              </Text>
            </View>
            <DownloadButton
              lecture={{
                id: item.lectureId,
                title: item.title,
                scholarName: item.scholarName,
                artworkUrl: item.artworkUrl,
                durationSecs: item.durationSecs,
                allowDownload: true,
              }}
              sourceUrl={item.sourceUrl}
            />
          </View>
        )}
      />
    </View>
  );
}
