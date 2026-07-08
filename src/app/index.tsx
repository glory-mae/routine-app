import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { colors } from "@/theme";
import { useRoutineStore } from "@/store/routine-store";

const AUTO_NAVIGATE_DELAY_MS = 1200;

export default function Splash() {
  const { settings } = useRoutineStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(settings.hasOnboarded ? "/home" : "/notifications");
    }, AUTO_NAVIGATE_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markGlyph}>✓</Text>
      </View>
      <Text style={styles.title}>Rune</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    backgroundColor: colors.splashBackground,
  },
  mark: {
    width: 104,
    height: 104,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  markGlyph: {
    fontSize: 44,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
});
