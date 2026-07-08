import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { colors, typography } from "@/theme";
import { sharedStyles } from "@/theme/shared";
import { useRoutineStore } from "@/store/routine-store";
import { formatTime } from "@/store/time";

export default function RoutineDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRoutine, deleteRoutine, toggleTask, deleteTask } = useRoutineStore();
  const routine = getRoutine(id ?? "");

  if (!routine) {
    // Deleted (or bad link) — nothing to show
    return <SafeAreaView style={styles.screen} edges={["top"]} />;
  }

  const showMenu = () => {
    Alert.alert(routine.name, undefined, [
      {
        text: "Edit Routine",
        onPress: () => router.push({ pathname: "/routine-edit", params: { id: routine.id } }),
      },
      {
        text: "Delete Routine",
        style: "destructive",
        onPress: () =>
          Alert.alert("Delete Routine", `Delete “${routine.name}” and all of its tasks?`, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                deleteRoutine(routine.id);
                router.back();
              },
            },
          ]),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const confirmDeleteTask = (taskId: string, taskName: string) => {
    Alert.alert("Delete Task", `Delete “${taskName}”?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTask(routine.id, taskId),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navPill} onPress={() => router.back()}>
          <Text style={styles.navPillGlyph}>‹</Text>
        </Pressable>
        <Pressable style={styles.navPill} onPress={showMenu}>
          <Text style={styles.navPillGlyph}>•••</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{routine.name}</Text>
          <View style={styles.meta}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{routine.frequency.toUpperCase()}</Text>
            </View>
            <Text style={styles.metaText}>
              {routine.tasks.length} task{routine.tasks.length === 1 ? "" : "s"}
              {routine.time ? ` · ${formatTime(routine.time)}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.taskList}>
          {routine.tasks.map((task) => (
            <View key={task.id} style={[styles.taskRow, sharedStyles.card]}>
              <Pressable
                style={[styles.checkbox, task.done && styles.checkboxDone]}
                onPress={() => toggleTask(routine.id, task.id)}
                hitSlop={8}
              >
                {task.done && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
              <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.name}</Text>
              {task.time && <Text style={styles.taskTime}>{formatTime(task.time)}</Text>}
              <Pressable
                hitSlop={8}
                onPress={() =>
                  router.push({
                    pathname: "/task-edit",
                    params: { routineId: routine.id, taskId: task.id },
                  })
                }
              >
                <Text style={styles.taskAction}>✎</Text>
              </Pressable>
              <Pressable hitSlop={8} onPress={() => confirmDeleteTask(task.id, task.name)}>
                <Text style={styles.taskAction}>🗑</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.addTask}
          onPress={() => router.push({ pathname: "/task-edit", params: { routineId: routine.id } })}
        >
          <Text style={styles.addTaskText}>+ Add Task</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  navPill: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(120,120,128,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  navPillGlyph: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  titleBlock: {
    gap: 8,
    paddingTop: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  taskList: {
    gap: 12,
  },
  taskRow: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkboxDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  taskTitleDone: {
    color: "rgba(28,28,30,0.45)",
    textDecorationLine: "line-through",
  },
  taskTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  taskAction: {
    fontSize: 15,
    color: "#C2C2C7",
  },
  addTask: {
    borderWidth: 1.5,
    borderColor: "rgba(217,119,87,0.45)",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  addTaskText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "600",
  },
});
