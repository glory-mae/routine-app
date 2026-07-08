import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { colors, typography } from "@/theme";
import { sharedStyles } from "@/theme/shared";
import { useRoutineStore } from "@/store/routine-store";
import { formatToday, nextOccurrenceLabel } from "@/store/time";

export default function Home() {
  const { routines } = useRoutineStore();

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Routines</Text>
          <Pressable style={styles.settingsButton} onPress={() => router.push("/settings")}>
            <Text style={styles.settingsGlyph}>⚙︎</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>{formatToday()}</Text>
      </View>

      {routines.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={styles.list}>
          {routines.map((routine) => {
            const next = nextOccurrenceLabel(routine);
            return (
              <Pressable
                key={routine.id}
                style={[styles.card, sharedStyles.card]}
                onPress={() =>
                  router.push({ pathname: "/routine-detail", params: { id: routine.id } })
                }
              >
                <View style={styles.cardTop}>
                  <View style={{ gap: 4 }}>
                    <Text style={styles.cardName}>{routine.name}</Text>
                    <Text style={styles.cardMeta}>
                      {routine.tasks.length} task{routine.tasks.length === 1 ? "" : "s"}
                    </Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{routine.frequency.toUpperCase()}</Text>
                  </View>
                </View>
                {next && (
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterText}>Next: {next}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      <Pressable style={styles.fab} onPress={() => router.push("/routine-edit")}>
        <Text style={styles.fabGlyph}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No routines yet</Text>
      <Text style={styles.emptyBody}>Create your first routine to start building better habits.</Text>
      <Pressable style={styles.emptyButton} onPress={() => router.push("/routine-edit")}>
        <Text style={styles.emptyButtonText}>+ New Routine</Text>
      </Pressable>
    </View>
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
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    ...typography.largeTitle,
    color: colors.textPrimary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(120,120,128,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsGlyph: {
    fontSize: 21,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  list: {
    flex: 1,
    gap: 14,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardName: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  cardMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    ...typography.caption,
    color: colors.accent,
    letterSpacing: 0.3,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    paddingTop: 8,
  },
  cardFooterText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  fabGlyph: {
    fontSize: 26,
    color: "#FFFFFF",
    fontWeight: "500",
    marginTop: -2,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 112,
    height: 112,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 21,
    color: colors.textPrimary,
    marginTop: 6,
  },
  emptyBody: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 260,
  },
  emptyButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 14,
    marginTop: 10,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
