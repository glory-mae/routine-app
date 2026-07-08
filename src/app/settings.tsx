import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { colors, typography } from "@/theme";
import { sharedStyles } from "@/theme/shared";
import { FieldLabel } from "@/components/FieldLabel";
import { ToggleRow } from "@/components/ToggleRow";
import { useRoutineStore } from "@/store/routine-store";
import { requestNotificationPermission } from "@/store/notifications";

export default function Settings() {
  const { settings, setNotificationsEnabled, clearAllData } = useRoutineStore();

  const toggleNotifications = async (next: boolean) => {
    if (!next) {
      setNotificationsEnabled(false);
      return;
    }
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
    } else {
      Alert.alert(
        "Notifications Disabled",
        "Enable notifications for Rune in the system Settings to get reminders.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const confirmClear = () => {
    Alert.alert("Clear All Data", "This deletes every routine and task. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear Everything", style: "destructive", onPress: clearAllData },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>‹ Routines</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <FieldLabel>Notifications</FieldLabel>
        <View style={[styles.field, sharedStyles.card]}>
          <ToggleRow
            label="Allow Notifications"
            value={settings.notificationsEnabled}
            onValueChange={(next) => void toggleNotifications(next)}
          />
        </View>

        <View style={styles.dangerSection}>
          <Pressable style={[styles.field, sharedStyles.card]} onPress={confirmClear}>
            <Text style={styles.dangerText}>Clear All Data</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 8,
  },
  backLink: {
    fontSize: 15,
    color: colors.accent,
  },
  title: {
    ...typography.largeTitle,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: 20,
    gap: 12,
  },
  field: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dangerSection: {
    marginTop: 28,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.danger,
  },
});
