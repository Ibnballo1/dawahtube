import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useSession } from "@/features/auth/hooks/useSession";
import { signOut } from "@/features/auth/services/authActions";

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
          Sign in to sync your bookmarks and history in the future.
        </Text>
        <Pressable
          onPress={() => router.push("/(auth)/sign-in")}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-text font-medium">Sign in</Text>
        </Pressable>
      </View>
    );
  }

  const authenticatedSession = session as {
    user: {
      name: string;
      email: string;
    };
  };

  return (
    <View className="flex-1 bg-background p-6 pt-12">
      <Text
        className="text-text text-xl font-semibold"
        accessibilityRole="header"
      >
        {authenticatedSession.user.name}
      </Text>
      <Text className="text-muted mt-1">{authenticatedSession.user.email}</Text>
      <Pressable
        onPress={() => signOut()}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        className="bg-card rounded-full py-3 items-center mt-8"
      >
        <Text className="text-text">Sign out</Text>
      </Pressable>
    </View>
  );
}
