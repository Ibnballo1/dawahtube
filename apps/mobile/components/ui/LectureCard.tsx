import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { lecturesApi } from "@/lib/api/endpoints";
import { DownloadButton } from "@/features/downloads/components/DownloadButton";

export interface LectureCardData {
  id: string;
  title: string;
  scholarName: string | null;
  thumbnailUrl: string | null;
  durationSecs: number | null;
  allowDownload: boolean;
}

function formatDuration(secs: number | null) {
  if (!secs) return null;
  const mins = Math.round(secs / 60);
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
}

export function LectureCard({ data }: { data: LectureCardData }) {
  const duration = formatDuration(data.durationSecs);

  return (
    <Pressable
      onPress={() => router.push(`/lecture/${data.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${data.title}${data.scholarName ? `, by ${data.scholarName}` : ""}`}
      className="flex-row bg-card rounded-xl p-3 mb-3 mx-4"
    >
      <Image
        source={data.thumbnailUrl}
        accessible={false}
        style={{
          width: 72,
          height: 72,
          borderRadius: 8,
          backgroundColor: "#0F172A",
        }}
        contentFit="cover"
      />
      <View className="flex-1 ml-3 justify-center">
        <Text className="text-text font-medium" numberOfLines={2}>
          {data.title}
        </Text>
        {data.scholarName && (
          <Text className="text-muted text-sm mt-1" numberOfLines={1}>
            {data.scholarName}
          </Text>
        )}
        {duration && (
          <Text className="text-muted text-xs mt-1">{duration}</Text>
        )}
      </View>
      {data.allowDownload && (
        <View className="ml-2 justify-center">
          <DownloadButton
            lecture={{
              id: data.id,
              title: data.title,
              scholarName: data.scholarName,
              artworkUrl: data.thumbnailUrl,
              durationSecs: data.durationSecs,
              allowDownload: true,
            }}
            getSourceUrl={async () =>
              (await lecturesApi.streamUrl(data.id)).url
            }
          />
        </View>
      )}
    </Pressable>
  );
}
