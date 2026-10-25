import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSession } from "@/features/auth/hooks/useSession";
import { signOut } from "@/features/auth/services/authActions";
import { useBookmarksStore } from "@/features/bookmarks/store/bookmarksStore";
import { DailyReminderSettings } from "@/features/notifications/components/DailyReminderSettings";

function LibraryCard() {
  const savedCount = useBookmarksStore(
    (s) => Object.keys(s.lectureBookmarks).length,
  );
  return (
    <View className="bg-card rounded-xl overflow-hidden">
      <Pressable
        onPress={() => router.push("/saved")}
        accessibilityRole="button"
        accessibilityLabel={`Saved lectures, ${savedCount}`}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <Text className="text-text">Saved lectures</Text>
        <View className="flex-row items-center">
          <Text className="text-muted mr-2">{savedCount}</Text>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </View>
      </Pressable>
    </View>
  );
}

export default function ProfileScreen() {
  const { data: session, isPending } = useSession();

  if (isPending) return null;

  if (!session) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text
          className="text-text text-lg font-semibold mb-2"
          accessibilityRole="header"
        >
          You&apos;re browsing as a guest
        </Text>
        <Text className="text-muted text-center mb-6">
          Sign in to keep your saved lectures and listening history across
          devices.
        </Text>
        <Pressable
          onPress={() => router.push("/(auth)/sign-in")}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-text font-medium">Sign in</Text>
        </Pressable>
        <View className="mt-6 w-full">
          <LibraryCard />
        </View>
        <View className="mt-4 w-full">
          <DailyReminderSettings />
        </View>
      </View>
    );
  }

  const user = (
    session as {
      user: { name: string; email: string; emailVerified: boolean };
    }
  ).user;

  return (
    <View className="flex-1 bg-background p-6 pt-12">
      <Text
        className="text-text text-xl font-semibold"
        accessibilityRole="header"
      >
        {user.name}
      </Text>
      <Text className="text-muted mt-1">{user.email}</Text>
      {!user.emailVerified && (
        <Text className="text-gold text-sm mt-1">Email not verified</Text>
      )}

      <View className="mt-8">
        <LibraryCard />
      </View>

      <View className="mt-4 bg-card rounded-xl overflow-hidden">
        <Pressable
          onPress={() => router.push("/account/edit-name")}
          accessibilityRole="button"
          accessibilityLabel="Edit name"
          className="px-4 py-3 border-b border-background"
        >
          <Text className="text-text">Edit name</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/account/change-password")}
          accessibilityRole="button"
          accessibilityLabel="Change password"
          className="px-4 py-3"
        >
          <Text className="text-text">Change password</Text>
        </Pressable>
      </View>

      <View className="mt-4">
        <DailyReminderSettings />
      </View>

      <Pressable
        onPress={() => signOut()}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        className="bg-card rounded-full py-3 items-center mt-6"
      >
        <Text className="text-text">Sign out</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/account/delete-account")}
        accessibilityRole="button"
        accessibilityLabel="Delete account"
        className="items-center mt-6"
      >
        <Text className="text-red-400 text-sm">Delete account</Text>
      </Pressable>
    </View>
  );
}
