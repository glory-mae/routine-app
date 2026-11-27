import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { colors } from "@/theme";
import { useRoutineStore } from "@/store/routine-store";
import { requestNotificationPermission } from "@/store/notifications";

export default function NotificationPrePrompt() {
  const { setNotificationsEnabled, markOnboarded } = useRoutineStore();

  const finish = () => {
    markOnboarded();
    router.replace("/home");
  };

  const enable = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    finish();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconGlyph}>🔔</Text>
        </View>
        <Text style={styles.title}>Stay on track</Text>
        <Text style={styles.body}>
          Rune can send a gentle reminder when it&apos;s time for a routine — only for the times you
          set, nothing else.
        </Text>
        <Pressable style={styles.primaryButton} onPress={enable}>
          <Text style={styles.primaryButtonText}>Enable Notifications</Text>
        </Pressable>
        <Pressable onPress={finish}>
          <Text style={styles.secondaryText}>Not now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 18,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlyph: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    textAlign: "center",
  },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
